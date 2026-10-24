const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));

  // Expired or invalid token: send the user back to the login page
  if (res.status === 401 && path !== '/auth/login') {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('logout'));
  }
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getDashboard: () => request('/dashboard'),
  getItems: () => request('/items'),
  saveItem: (item) => request('/items', { method: 'POST', body: JSON.stringify(item) }),
  updateItem: (id, item) => request(`/items/${id}`, { method: 'PUT', body: JSON.stringify(item) }),
  deleteItem: (id) => request(`/items/${id}`, { method: 'DELETE' }),
  checkout: (body) => request('/bills', { method: 'POST', body: JSON.stringify(body) }),
  getBills: () => request('/bills'),
};
