const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function fetchItems(filters = {}) {
  const params = new URLSearchParams();
  if (filters.mode) params.set('mode', filters.mode);
  if (filters.type) params.set('type', filters.type);
  if (filters.q) params.set('q', filters.q);
  if (filters.agent_id) params.set('agent_id', filters.agent_id);
  const qs = params.toString();
  const url = `${API_BASE}/items${qs ? '?' + qs : ''}`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchItem(id) {
  const res = await fetch(`${API_BASE}/items/${id}`);
  return res.json();
}

export async function createItem(item) {
  const res = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return res.json();
}

export async function updateItem(id, updates) {
  const res = await fetch(`${API_BASE}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`${API_BASE}/items/${id}`, {
    method: 'DELETE',
  });
  return res.ok;
}

export async function registerAgent(agent) {
  const res = await fetch(`${API_BASE}/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agent),
  });
  return res.json();
}

export async function getAgent(id) {
  const res = await fetch(`${API_BASE}/agents/${id}`);
  return res.json();
}

export async function getAllAgents() {
  const res = await fetch(`${API_BASE}/agents`);
  return res.json();
}

export async function getSkills() {
  const res = await fetch(`${API_BASE}/skills`);
  return res.json();
}

export async function getSkillManifest(name) {
  const res = await fetch(`${API_BASE}/skills/${name}/manifest`);
  return res.json();
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