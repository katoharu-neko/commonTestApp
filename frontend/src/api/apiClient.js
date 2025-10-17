// frontend/src/api/apiClient.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// 毎回 Authorization を付与
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // ← キー名を統一
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
