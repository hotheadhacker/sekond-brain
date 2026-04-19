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
    agent_id TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_seen TEXT NOT NULL
  )
`);

const itemCols = ['id', 'type', 'title', 'content', 'mode', 'tags', 'agent_id', 'createdAt', 'updatedAt'];

export function getAllItems(filters = {}) {
  let query = `SELECT ${itemCols.join(', ')} FROM items WHERE 1=1`;
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

  query += ' ORDER BY createdAt DESC';
  const rows = db.prepare(query).all(...params);
  return rows.map(row => ({
    ...row,
    tags: JSON.parse(row.tags),
    agent_id: row.agent_id || null,
  }));
}

export function getItemById(id) {
  const row = db.prepare(`SELECT ${itemCols.join(', ')} FROM items WHERE id = ?`).get(id);
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
    agent_id: item.agent_id || null,
    createdAt: now,
    updatedAt: now,
  };
  db.prepare(`
    INSERT INTO items (id, type, title, content, mode, tags, agent_id, createdAt, updatedAt)
    VALUES (@id, @type, @title, @content, @mode, @tags, @agent_id, @createdAt, @updatedAt)
  `).run(row);
  return { ...row, tags: item.tags || [], agent_id: row.agent_id };
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
      type = @type,
      title = @title,
      content = @content,
      mode = @mode,
      tags = @tags,
      agent_id = @agent_id,
      updatedAt = @updatedAt
    WHERE id = @id
  `).run({
    ...merged,
    tags: JSON.stringify(merged.tags),
    agent_id: merged.agent_id || null,
  });

  return merged;
}

export function deleteItem(id) {
  const result = db.prepare('DELETE FROM items WHERE id = ?').run(id);
  return result.changes > 0;
}

// --- Agents ---

export function registerAgent(agent) {
  const now = new Date().toISOString();
  const id = agent.id || crypto.randomUUID();
  const existing = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);

  if (existing) {
    db.prepare('UPDATE agents SET name = ?, last_seen = ? WHERE id = ?').run(
      agent.name || existing.name,
      now,
      id
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