import apiClient from "./apiClient";

// 全ユーザー取得
export const getAllUsers = async () => {
  const res = await apiClient.get("/users");
  return res.data;
};

// ユーザー登録
export const registerUser = async (user) => {
  const res = await apiClient.post("/users", user);
  return res.data;
};

// ログイン
export const loginUser = async (credentials) => {
  const res = await apiClient.post("/auth/login", credentials);
  const { token } = res.data;
  localStorage.setItem("token", token); // JWTを保存
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  return token;
};

