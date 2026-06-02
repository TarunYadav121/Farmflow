import axios from 'axios';

// Base URL — CRA proxy handles /api -> http://localhost:5000 in dev
const api = axios.create({
  baseURL: '/api',
});

// Attach token to every request if present
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
