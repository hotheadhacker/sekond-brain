import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllItems, getItemById, createItem, updateItem, deleteItem } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/items', (req, res) => {
  const filters = {};
  if (req.query.mode) filters.mode = req.query.mode;
  if (req.query.type) filters.type = req.query.type;
  if (req.query.q) filters.q = req.query.q;
  res.json(getAllItems(filters));
});

app.get('/api/items/:id', (req, res) => {
  const item = getItemById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.post('/api/items', (req, res) => {
  const item = createItem(req.body);
  res.status(201).json(item);
});

app.put('/api/items/:id', (req, res) => {
  const item = updateItem(req.params.id, req.body);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.delete('/api/items/:id', (req, res) => {
  const ok = deleteItem(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});