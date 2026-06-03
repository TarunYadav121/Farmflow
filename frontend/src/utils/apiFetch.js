
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });

  // Token expired or invalid — broadcast so App.js can react
  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:expired'));
  }

  return res;
}

export default apiFetch;
