// src/api/apiClient.js
import axios from 'axios';
import { getToken } from '../auth';

const api = axios.create({
  baseURL: 'http://localhost:8080', // 必要に応じて .env に逃がしてOK
  withCredentials: false,
});

// 認証ヘッダを自動付与
api.interceptors.request.use((config) => {
  const jwt = getToken();
  if (jwt) {
    config.headers.Authorization = `Bearer ${jwt}`;
  }
  return config;
});

export default api;
