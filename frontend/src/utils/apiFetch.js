const API_URL = process.env.REACT_APP_API_URL || "";

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_URL}${url}`, { ...options, headers });

  if (res.status === 401) {
    window.dispatchEvent(new Event("auth:expired"));
  }

  return res;
}

export default apiFetch;