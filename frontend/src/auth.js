// frontend/src/auth.js
export const getToken = () => localStorage.getItem('jwtToken');

export const isAuthenticated = () => {
  const t = getToken();
  return !!t && t.trim().length > 0;
};

export const loginWithToken = (token) => {
  localStorage.setItem('jwtToken', token);
};

export const logout = () => {
  localStorage.removeItem('jwtToken');
};
