import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '..', 'data.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'note',
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    mode TEXT NOT NULL DEFAULT 'life',
    tags TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'active',
    folder TEXT NOT NULL DEFAULT '',
    agent_id TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    context TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL,
    FOREIGN KEY (source_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES items(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_links_source ON links(source_id)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_links_target ON links(target_id)
`);

// Migrations: add columns that may not exist in older databases
const existingCols = new Set(
  db.prepare("PRAGMA table_info(items)").all().map(c => c.name)
);
if (!existingCols.has('status')) {
  db.exec("ALTER TABLE items ADD COLUMN status TEXT NOT NULL DEFAULT 'active'");
}
if (!existingCols.has('folder')) {
  db.exec("ALTER TABLE items ADD COLUMN folder TEXT NOT NULL DEFAULT ''");
}
if (!existingCols.has('agent_id')) {
  db.exec("ALTER TABLE items ADD COLUMN agent_id TEXT");
}

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_items_mode ON items(mode)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_items_type ON items(type)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_items_status ON items(status)
`);

// --- Items ---

const ITEM_COLS = ['id', 'type', 'title', 'content', 'mode', 'tags', 'status', 'folder', 'agent_id', 'createdAt', 'updatedAt'];

export function getAllItems(filters = {}) {
  let query = `SELECT ${ITEM_COLS.join(', ')} FROM items WHERE 1=1`;
  const params = [];

  if (filters.mode) {
    query += ' AND mode = ?';
    params.push(filters.mode);
  }
  if (filters.type) {
    const types = filters.type.split(',');
    query += ` AND type IN (${types.map(() => '?').join(',')})`;
    params.push(...types);
  }
  if (filters.q) {
    query += ' AND (title LIKE ? OR content LIKE ?)';
    const term = `%${filters.q}%`;
    params.push(term, term);
  }
  if (filters.agent_id) {
    query += ' AND agent_id = ?';
    params.push(filters.agent_id);
  }
  if (filters.status) {
    const statuses = filters.status.split(',');
    query += ` AND status IN (${statuses.map(() => '?').join(',')})`;
    params.push(...statuses);
  }
  if (filters.folder) {
    query += ' AND folder = ?';
    params.push(filters.folder);
  }

  query += ' ORDER BY updatedAt DESC';
  const rows = db.prepare(query).all(...params);
  return rows.map(row => ({
    ...row,
    tags: JSON.parse(row.tags),
    agent_id: row.agent_id || null,
  }));
}

export function getItemById(id) {
  const row = db.prepare(`SELECT ${ITEM_COLS.join(', ')} FROM items WHERE id = ?`).get(id);
  if (!row) return null;
  return { ...row, tags: JSON.parse(row.tags), agent_id: row.agent_id || null };
}

export function createItem(item) {
  const now = new Date().toISOString();
  const row = {
    id: item.id || crypto.randomUUID(),
    type: item.type || 'note',
    title: item.title || '',
    content: item.content || '',
    mode: item.mode || 'life',
    tags: JSON.stringify(item.tags || []),
    status: item.status || 'active',
    folder: item.folder || '',
    agent_id: item.agent_id || null,
    createdAt: now,
    updatedAt: now,
  };
  db.prepare(`
    INSERT INTO items (id, type, title, content, mode, tags, status, folder, agent_id, createdAt, updatedAt)
    VALUES (@id, @type, @title, @content, @mode, @tags, @status, @folder, @agent_id, @createdAt, @updatedAt)
  `).run(row);

  const result = { ...row, tags: item.tags || [], agent_id: row.agent_id };
  if (row.content) {
    syncLinks(row.id, row.content);
  }
  return result;
}

export function updateItem(id, updates) {
  const existing = getItemById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const merged = {
    ...existing,
    ...updates,
    id,
    updatedAt: now,
  };

  db.prepare(`
    UPDATE items SET
      type = @type, title = @title, content = @content, mode = @mode,
      tags = @tags, status = @status, folder = @folder, agent_id = @agent_id,
      updatedAt = @updatedAt
    WHERE id = @id
  `).run({
    ...merged,
    tags: JSON.stringify(merged.tags),
    agent_id: merged.agent_id || null,
  });

  if (updates.content !== undefined) {
    syncLinks(id, merged.content);
  }

  return merged;
}

export function deleteItem(id) {
  db.prepare('DELETE FROM links WHERE source_id = ? OR target_id = ?').run(id, id);
  const result = db.prepare('DELETE FROM items WHERE id = ?').run(id);
  return result.changes > 0;
}

// --- Links ---

const WIKILINK_RE = /\[\[([a-f0-9-]{36})\|([^\]]+)\]\]/g;

function syncLinks(itemId, content) {
  db.prepare('DELETE FROM links WHERE source_id = ?').run(itemId);

  const links = [];
  let match;
  const re = new RegExp(WIKILINK_RE.source, WIKILINK_RE.flags);
  while ((match = re.exec(content)) !== null) {
    links.push({ targetId: match[1], context: match[2] });
  }

  const now = new Date().toISOString();
  const insert = db.prepare('INSERT INTO links (id, source_id, target_id, context, createdAt) VALUES (?, ?, ?, ?, ?)');
  for (const link of links) {
    const existing = db.prepare('SELECT id FROM items WHERE id = ?').get(link.targetId);
    if (existing) {
      insert.run(crypto.randomUUID(), itemId, link.targetId, link.context, now);
    }
  }
}

export function getBacklinks(itemId) {
  const rows = db.prepare(`
    SELECT l.*, i.title, i.type, i.mode, i.status
    FROM links l
    JOIN items i ON l.source_id = i.id
    WHERE l.target_id = ?
    ORDER BY l.createdAt DESC
  `).all(itemId);
  return rows;
}

export function getOutlinks(itemId) {
  const rows = db.prepare(`
    SELECT l.*, i.title, i.type, i.mode, i.status
    FROM links l
    JOIN items i ON l.target_id = i.id
    WHERE l.source_id = ?
    ORDER BY l.createdAt DESC
  `).all(itemId);
  return rows;
}

export function getGraph() {
  const nodes = db.prepare('SELECT id, title, type, mode, status FROM items').all();
  const edges = db.prepare('SELECT source_id AS source, target_id AS target FROM links').all();
  return { nodes, edges };
}

export function getAllTags() {
  const rows = db.prepare('SELECT tags FROM items').all();
  const tagCounts = {};
  for (const row of rows) {
    const tags = JSON.parse(row.tags);
    for (const tag of tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  return Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// --- Agents ---

export function registerAgent(agent) {
  const now = new Date().toISOString();
  const id = agent.id || crypto.randomUUID();
  const existing = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);

  if (existing) {
    db.prepare('UPDATE agents SET name = ?, last_seen = ? WHERE id = ?').run(
      agent.name || existing.name, now, id
    );
    return { id, name: agent.name || existing.name, created_at: existing.created_at, last_seen: now };
  }

  const row = { id, name: agent.name || `agent-${id.slice(0, 8)}`, created_at: now, last_seen: now };
  db.prepare('INSERT INTO agents (id, name, created_at, last_seen) VALUES (@id, @name, @created_at, @last_seen)').run(row);
  return row;
}

export function getAgent(id) {
  return db.prepare('SELECT * FROM agents WHERE id = ?').get(id) || null;
}

export function getAllAgents() {
  return db.prepare('SELECT * FROM agents ORDER BY last_seen DESC').all();
}

export default db;