// Lightweight client-side token helpers.
// The backend remains the source of truth — this only avoids rendering protected
// screens (and firing doomed requests) with a token we can already tell is expired.

export function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function isTokenValid(token) {
  if (!token) return false;
  const payload = decodeToken(token);
  if (!payload || typeof payload.exp !== 'number') return false;
  return payload.exp * 1000 > Date.now();
}

export function getValidToken() {
  const token = localStorage.getItem('token');
  if (!isTokenValid(token)) {
    if (token) localStorage.removeItem('token');
    return null;
  }
  return token;
}

export function logout() {
  localStorage.removeItem('token');
}
