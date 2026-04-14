const AUTH_SESSION_KEY = 'is_authenticated';

export const setAuthenticatedSession = () => {
  localStorage.setItem(AUTH_SESSION_KEY, 'true');
};

export const clearAuthenticatedSession = () => {
  localStorage.removeItem(AUTH_SESSION_KEY);
};

export const isAuthenticatedSession = () => {
  return localStorage.getItem(AUTH_SESSION_KEY) === 'true';
};
