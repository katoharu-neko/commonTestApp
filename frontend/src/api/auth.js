import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/auth";

export const login = async (email, password) => {
  const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
  return response.data;
};

export const register = async (name, email, password) => {
  const response = await axios.post(`${API_BASE_URL}/register`, { name, email, password });
  return response.data;
};
