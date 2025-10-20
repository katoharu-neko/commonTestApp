// src/api/apiClient.js
import axios from 'axios';

// 本番（NODE_ENV !== 'development'）は同一オリジンを使い、
// ローカル開発だけ localhost:8080 を使う。
// 明示的に REACT_APP_API_BASE_URL があればそれを優先。
const isDev = process.env.NODE_ENV === 'development';
const API_BASE =
  process.env.REACT_APP_API_BASE_URL ??
  (isDev ? 'http://localhost:8080' : ''); // 本番は ''（相対URL＝同一オリジン）

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // JWTをHeaderで送る想定のまま
});

// リクエスト: Authorization 自動付与
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers?.Authorization) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// レスポンス: 401ならログインへ
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
