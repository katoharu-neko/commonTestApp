// src/api/authApi.js
import api from './apiClient';

export async function register(payload) {
  const res = await api.post('/api/auth/register', payload);
  return res.data; // { message } or { token }（バックエンド実装に準拠）
}

export async function login(payload) {
  const res = await api.post('/api/auth/login', payload);
  return res.data; // { token }
}

export async function verifyEmail(token) {
  const res = await api.get('/api/auth/verify', { params: { token } });
  return res.data; // { message }
}

const authApi = { register, login, verifyEmail };
export default authApi;
