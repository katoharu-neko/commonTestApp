// src/auth.js
const TOKEN_KEY = 'token';
const TOKEN_EVENT = 'app:token-changed';

const dispatchTokenChange = () => {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') {
    return;
  }
  try {
    const event = new CustomEvent(TOKEN_EVENT);
    window.dispatchEvent(event);
  } catch (err) {
    const fallbackEvent = { type: TOKEN_EVENT };
    window.dispatchEvent(fallbackEvent);
  }
};

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
  dispatchTokenChange();
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  dispatchTokenChange();
};
export const isAuthed = () => !!getToken();

export const subscribeTokenChange = (listener) => {
  if (typeof window === 'undefined') {
    return function noop() {};
  }

  const handleChange = function () {
    if (typeof listener === 'function') {
      listener();
    }
  };

  const handleStorage = function (event) {
    if (!event || event.key !== TOKEN_KEY) {
      return;
    }
    handleChange();
  };

  window.addEventListener(TOKEN_EVENT, handleChange);
  window.addEventListener('storage', handleStorage);

  return function unsubscribe() {
    window.removeEventListener(TOKEN_EVENT, handleChange);
    window.removeEventListener('storage', handleStorage);
  };
};
