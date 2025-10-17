import apiClient from "./apiClient";

// スコア登録
export const registerScore = async (score) => {
  const res = await apiClient.post("/scores", score);
  return res.data;
};

// 特定ユーザーのスコア取得
export const getScoresByUserId = async (userId) => {
  const res = await apiClient.get(`/scores/user/${userId}`);
  return res.data;
};
