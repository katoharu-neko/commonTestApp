// src/auth.js
const TOKEN_KEY = 'token';

const normalizeToken = (token) => {
  if (!token) return '';
  const trimmed = token.trim();
  return trimmed.startsWith('Bearer ')
    ? trimmed.slice(7).trim()
    : trimmed;
};

export const getToken = () => {
  const stored = localStorage.getItem(TOKEN_KEY) || '';
  const normalized = normalizeToken(stored);
  if (normalized !== stored) {
    if (normalized) {
      localStorage.setItem(TOKEN_KEY, normalized);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
  return normalized;
};

export const setToken = (token) => {
  const normalized = normalizeToken(token);
  if (normalized) {
    localStorage.setItem(TOKEN_KEY, normalized);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isAuthed = () => !!getToken();
