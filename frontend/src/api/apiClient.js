// src/api/apiClient.js
import axios from 'axios';

// auth ユーティリティ（存在しない場合は後述の簡易版を作成してください）
import { clearToken, getToken } from '../auth';

// 本番（NODE_ENV !== 'development'）は同一オリジンを使い、
// ローカル開発だけ http://localhost:8080 を使う。
// 明示的に REACT_APP_API_BASE_URL があればそれを優先。
const isDev = process.env.NODE_ENV === 'development';
const API_BASE =
  process.env.REACT_APP_API_BASE_URL ??
  (isDev ? 'http://localhost:8080' : ''); // 本番は ''（相対URL＝同一オリジン）

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // JWT は Authorization ヘッダで送る前提
});

// リクエスト: Authorization を自動付与（既に指定されていれば触らない）
api.interceptors.request.use((config) => {
  const headers = config.headers ?? {};
  const alreadySet =
    headers.Authorization ?? headers.authorization ?? (typeof headers.get === 'function' && (headers.get('Authorization') || headers.get('authorization')));

  if (!alreadySet) {
    const raw = (typeof getToken === 'function' ? getToken() : localStorage.getItem('token')) || '';
    if (raw) {
      const normalized = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
      if (typeof headers.set === 'function') {
        headers.set('Authorization', normalized);
      } else {
        headers.Authorization = normalized;
      }
    }
  }

  config.headers = headers;
  return config;
});

// レスポンス: 401 ならトークンを消してアプリ側に通知
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        if (typeof clearToken === 'function') clearToken();
        else localStorage.removeItem('token');
      } finally {
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('app:unauthorized');
          window.dispatchEvent(event);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
