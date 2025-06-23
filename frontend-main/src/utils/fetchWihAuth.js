// fetchWithAuth.js
// Use this function instead of fetch for API calls that require auth.
export default async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = options.headers ? { ...options.headers } : {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    localStorage.removeItem('token');
    // Pass a query param to show session expired message on login page
    window.location.href = '/login?session=expired';
    return Promise.reject(new Error('Session expired. Please login again.'));
  }
  return response;
}
