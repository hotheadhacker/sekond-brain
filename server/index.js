import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAllItems, getItemById, createItem, updateItem, deleteItem,
  getBacklinks, getOutlinks, getGraph, getAllTags,
  registerAgent, getAgent, getAllAgents
} from './db.js';
import { readdirSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json());

// --- Items ---

app.get('/api/items', (req, res) => {
  const filters = {};
  if (req.query.mode) filters.mode = req.query.mode;
  if (req.query.type) filters.type = req.query.type;
  if (req.query.q) filters.q = req.query.q;
  if (req.query.agent_id) filters.agent_id = req.query.agent_id;
  if (req.query.status) filters.status = req.query.status;
  if (req.query.folder) filters.folder = req.query.folder;
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

// --- Links ---

app.get('/api/items/:id/backlinks', (req, res) => {
  res.json(getBacklinks(req.params.id));
});

app.get('/api/items/:id/outlinks', (req, res) => {
  res.json(getOutlinks(req.params.id));
});

// --- Graph ---

app.get('/api/graph', (_req, res) => {
  res.json(getGraph());
});

// --- Tags ---

app.get('/api/tags', (_req, res) => {
  res.json(getAllTags());
});

// --- Agents ---

app.post('/api/agents', (req, res) => {
  const agent = registerAgent(req.body);
  res.status(201).json(agent);
});

app.get('/api/agents', (_req, res) => {
  res.json(getAllAgents());
});

app.get('/api/agents/:id', (req, res) => {
  const agent = getAgent(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json(agent);
});

// --- Skills ---

const SKILLS_DIR = path.join(__dirname, '..', 'skills');

app.get('/api/skills', (_req, res) => {
  try {
    const dirs = readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    const skills = dirs.map(name => {
      try {
        const manifest = JSON.parse(readFileSync(path.join(SKILLS_DIR, name, 'manifest.json'), 'utf-8'));
        return { name: manifest.name, version: manifest.version, description: manifest.description };
      } catch { return null; }
    }).filter(Boolean);
    res.json(skills);
  } catch { res.json([]); }
});

app.get('/api/skills/:name/manifest', (req, res) => {
  try {
    const manifest = JSON.parse(readFileSync(path.join(SKILLS_DIR, req.params.name, 'manifest.json'), 'utf-8'));
    res.json(manifest);
  } catch { res.status(404).json({ error: 'Skill not found' }); }
});

app.get('/api/skills/:name/docs', (req, res) => {
  try {
    const docs = readFileSync(path.join(SKILLS_DIR, req.params.name, 'docs.md'), 'utf-8');
    res.type('text/markdown').send(docs);
  } catch { res.status(404).json({ error: 'Docs not found' }); }
});

app.get('/api/skills/check-updates', (req, res) => {
  try {
    const dirs = readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory()).map(d => d.name);
    const skills = dirs.map(name => {
      try {
        const manifest = JSON.parse(readFileSync(path.join(SKILLS_DIR, name, 'manifest.json'), 'utf-8'));
        return { name: manifest.name, version: manifest.version };
      } catch { return null; }
    }).filter(Boolean);
    const clientVersions = req.query.versions ? JSON.parse(req.query.versions) : {};
    const updates = skills.filter(s => {
      const cv = clientVersions[s.name];
      return !cv || cv !== s.version;
    });
    res.json({ latest: skills, updates_available: updates });
  } catch { res.json({ latest: [], updates_available: [] }); }
});

// --- Static / SPA ---

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});