// frontend/src/api/scoreApi.js
import api from './apiClient';

// 自分のスコア一覧を取得
export const getMyScores = async () => {
  const res = await api.get('/api/scores/me');
  return res.data; // [{id, userId, subject, score, year, createdAt}, ...]
};
