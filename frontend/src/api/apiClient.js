// src/api/apiClient.js
import axios from 'axios';

import { clearToken, getToken } from '../auth';

// 本番（NODE_ENV !== 'development'）は同一オリジンを使い、
// ローカル開発だけ localhost:8080 を使う。
// 明示的に REACT_APP_API_BASE_URL があればそれを優先。
const isDev = process.env.NODE_ENV === 'development';
const API_BASE =
  process.env.REACT_APP_API_BASE_URL ??
  (isDev ? 'http://localhost:8080' : ''); // 本番は ''（相対URL＝同一オリジン）

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // JWTはAuthorizationヘッダで送る前提のまま
});

// リクエスト: Authorization 自動付与
api.interceptors.request.use((config) => {
<<<<<<< ours
<<<<<<< ours
  const token = localStorage.getItem('token');
  if (token) {
=======
  const token = getToken();
  if (token && !config.headers?.Authorization) {
>>>>>>> theirs
    config.headers = config.headers ?? {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
=======
  const headers = config.headers ?? {};
  const existingAuth = headers.Authorization ?? headers.authorization;

  if (!existingAuth) {
    const token = getToken();
    if (token) {
      headers.Authorization = token.startsWith('Bearer ')
        ? token
        : `Bearer ${token}`;
>>>>>>> theirs
    }
  }

  return {
    ...config,
    headers,
  };
});

// レスポンス: 401ならログインへ
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
