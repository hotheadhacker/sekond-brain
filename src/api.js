const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (opts.method === 'DELETE') return res.ok;
  return res.json();
}

export async function fetchItems(filters = {}) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, v);
  }
  const qs = params.toString();
  return request(`${API_BASE}/items${qs ? '?' + qs : ''}`);
}

export async function fetchItem(id) {
  return request(`${API_BASE}/items/${id}`);
}

export async function createItem(item) {
  return request(`${API_BASE}/items`, { method: 'POST', body: JSON.stringify(item) });
}

export async function updateItem(id, updates) {
  return request(`${API_BASE}/items/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
}

export async function deleteItem(id) {
  return request(`${API_BASE}/items/${id}`, { method: 'DELETE' });
}

export async function fetchBacklinks(id) {
  return request(`${API_BASE}/items/${id}/backlinks`);
}

export async function fetchOutlinks(id) {
  return request(`${API_BASE}/items/${id}/outlinks`);
}

export async function fetchGraph() {
  return request(`${API_BASE}/graph`);
}

export async function fetchTags() {
  return request(`${API_BASE}/tags`);
}

export async function registerAgent(agent) {
  return request(`${API_BASE}/agents`, { method: 'POST', body: JSON.stringify(agent) });
}

export async function getAgent(id) {
  return request(`${API_BASE}/agents/${id}`);
}

export async function getAllAgents() {
  return request(`${API_BASE}/agents`);
}

export async function getSkills() {
  return request(`${API_BASE}/skills`);
}

export async function getSkillManifest(name) {
  return request(`${API_BASE}/skills/${name}/manifest`);
}

export async function getSkillDocs(name) {
  const res = await fetch(`${API_BASE}/skills/${name}/docs`);
  return res.text();
}

export async function checkSkillUpdates(clientVersions) {
  const params = new URLSearchParams();
  if (clientVersions) params.set('versions', JSON.stringify(clientVersions));
  const res = await fetch(`${API_BASE}/skills/check-updates?${params.toString()}`);
  return res.json();
}