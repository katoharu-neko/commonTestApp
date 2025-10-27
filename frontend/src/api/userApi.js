// src/api/userApi.js
import api from './apiClient';

export async function fetchCurrentUser() {
  const res = await api.get('/api/users/me');
  return res.data;
}

const userApi = {
  fetchCurrentUser,
};

export default userApi;
