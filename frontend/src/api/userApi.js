// frontend/src/api/userApi.js
import api from './apiClient';

export const login = async (email, password) => {
  const res = await api.post('/api/auth/login', { email, password });
  return res.data; // { token }
};

export const register = async (name, email, password) => {
  const res = await api.post('/api/auth/register', { name, email, password });
  return res.data; // { token }
};
