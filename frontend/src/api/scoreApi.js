// src/api/scoreApi.js
import apiClient from './apiClient';

export async function getMyScores() {
  const res = await apiClient.get('/api/scores/me'); // ← /me を利用
  return res.data;
}
