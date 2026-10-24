const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  getItems: () => request('/items'),
  saveItem: (item) => request('/items', { method: 'POST', body: JSON.stringify(item) }),
  checkout: (items) => request('/bills', { method: 'POST', body: JSON.stringify({ items }) }),
  getBills: () => request('/bills'),
};
