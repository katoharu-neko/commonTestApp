import api from "./apiClient";

// name, email, password, roleId を送る
export const register = (name, email, password, roleId) =>
  api.post("/api/auth/register", { name, email, password, roleId });

export const login = (email, password) =>
  api.post("/api/auth/login", { email, password });
