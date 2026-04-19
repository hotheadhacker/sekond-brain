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
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`);

export function getAllItems(filters = {}) {
  let query = 'SELECT * FROM items WHERE 1=1';
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

  query += ' ORDER BY createdAt DESC';
  const rows = db.prepare(query).all(...params);
  return rows.map(row => ({
    ...row,
    tags: JSON.parse(row.tags),
  }));
}

export function getItemById(id) {
  const row = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!row) return null;
  return { ...row, tags: JSON.parse(row.tags) };
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
    createdAt: now,
    updatedAt: now,
  };
  db.prepare(`
    INSERT INTO items (id, type, title, content, mode, tags, createdAt, updatedAt)
    VALUES (@id, @type, @title, @content, @mode, @tags, @createdAt, @updatedAt)
  `).run(row);
  return { ...row, tags: item.tags || [] };
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
      updatedAt = @updatedAt
    WHERE id = @id
  `).run({
    ...merged,
    tags: JSON.stringify(merged.tags),
  });

  return merged;
}

export function deleteItem(id) {
  const result = db.prepare('DELETE FROM items WHERE id = ?').run(id);
  return result.changes > 0;
}

export default db;