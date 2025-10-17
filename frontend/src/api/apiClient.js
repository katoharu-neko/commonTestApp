// src/api/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default apiClient;
