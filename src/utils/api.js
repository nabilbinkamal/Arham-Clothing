export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('adminToken');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  // If body is FormData, don't set Content-Type header manually
  if (!(options.body instanceof FormData) && !headers.has('Content-Type') && options.method && options.method !== 'GET' && options.method !== 'DELETE') {
    headers.append('Content-Type', 'application/json');
  }

  // Prevent caching for GET requests by appending a timestamp
  let finalUrl = url;
  if (!options.method || options.method === 'GET') {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${separator}_t=${new Date().getTime()}`;
  }

  const response = await fetch(finalUrl, { ...options, headers });
  
  if (response.status === 401 || response.status === 403) {
    try {
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      if (data.error === 'Invalid or expired token.' || data.error === 'Access denied. Token missing.') {
        localStorage.removeItem('adminToken');
        // We only reload if we are on an admin page to prevent randomly logging out users 
        // who might just have an expired admin token but are browsing the public site
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
      }
    } catch {
      // Ignore if response is not JSON
    }
  }

  return response;
};
