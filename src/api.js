const API_BASE = '/api';

export async function fetchItems(filters = {}) {
  const params = new URLSearchParams();
  if (filters.mode) params.set('mode', filters.mode);
  if (filters.type) params.set('type', filters.type);
  if (filters.q) params.set('q', filters.q);
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