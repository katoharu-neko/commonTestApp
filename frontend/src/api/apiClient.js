// src/api/apiClient.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || 'http://localhost:8080',
  withCredentials: false,
});

// すべてのリクエストに JWT を付与
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

export default api;
