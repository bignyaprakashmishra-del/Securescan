// SecureScan API Client
const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Send and receive HTTP-only cookies
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  // If response is a file download (like PDF report)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/pdf')) {
    if (!response.ok) {
      throw new Error('Failed to download PDF report');
    }
    return response.blob();
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.details = data.details;
    throw error;
  }

  return data;
}

// Auth API
export const authApi = {
  register: (name, email, password) => apiRequest('/auth/register', { method: 'POST', body: { name, email, password } }),
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getCurrentUser: () => apiRequest('/auth/me'),
};

// Websites API
export const websitesApi = {
  getAll: () => apiRequest('/websites'),
  create: (domain) => apiRequest('/websites', { method: 'POST', body: { domain } }),
  verify: (id) => apiRequest(`/websites/${id}/verify`, { method: 'POST' }),
  delete: (id) => apiRequest(`/websites/${id}`, { method: 'DELETE' }),
};

// Scans API
export const scansApi = {
  create: (websiteId) => apiRequest(`/scans/${websiteId}`, { method: 'POST' }),
  getAll: () => apiRequest('/scans'),
  getById: (id) => apiRequest(`/scans/${id}`),
  downloadReport: (id) => apiRequest(`/scans/${id}/report`),
  compare: (id, compareWithId) => apiRequest(`/scans/${id}/compare?targetId=${compareWithId}`),
};

// Demo API (for judges demo mode)
export const demoApi = {
  getOverview: () => apiRequest('/demo/overview'),
  getWebsites: () => apiRequest('/demo/websites'),
  getScan: (id) => apiRequest(`/demo/scans/${id}`),
  getCompare: (id1, id2) => apiRequest(`/demo/scans/compare?scanA=${id1}&scanB=${id2}`),
  downloadReport: (id) => apiRequest(`/demo/scans/${id}/report`),
};
