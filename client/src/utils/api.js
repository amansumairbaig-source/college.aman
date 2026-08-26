// API Client helper
// Supports Vercel deployed frontend connecting to Render backend URL
const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : '';

const BASE_URL = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

export function getAttachmentUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BACKEND_URL}${url}`;
}

export async function fetchJson(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Network response was not ok' }));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

// Auth API
export const authApi = {
  login: (credentials) =>
    fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  register: (data) =>
    fetchJson('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getUsers: (role) => fetchJson(`/auth/users${role ? `?role=${role}` : ''}`),
  getDepartments: () => fetchJson('/auth/departments')
};

// Complaints API
export const complaintApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return fetchJson(`/complaints?${query.toString()}`);
  },
  getById: (id) => fetchJson(`/complaints/${id}`),
  create: async (formData) => {
    if (formData instanceof FormData) {
      const res = await fetch(`${BASE_URL}/complaints`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Creation failed' }));
        throw new Error(errorData.error || 'Failed to submit complaint');
      }
      return res.json();
    } else {
      return fetchJson('/complaints', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
    }
  },
  updateStatus: (id, payload) =>
    fetchJson(`/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  assign: (id, payload) =>
    fetchJson(`/complaints/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  updatePriority: (id, payload) =>
    fetchJson(`/complaints/${id}/priority`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  addComment: (id, payload) =>
    fetchJson(`/complaints/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  submitFeedback: (id, payload) =>
    fetchJson(`/complaints/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  delete: (id) =>
    fetchJson(`/complaints/${id}`, {
      method: 'DELETE'
    })
};

// Analytics API
export const analyticsApi = {
  get: () => fetchJson('/analytics')
};

// AI API
export const aiApi = {
  categorize: (data) =>
    fetchJson('/ai/categorize', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  summarize: (data) =>
    fetchJson('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  checkDuplicates: (data) =>
    fetchJson('/ai/check-duplicates', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};

// Notifications API
export const notificationApi = {
  getAll: (userId) => fetchJson(`/notifications${userId ? `?userId=${userId}` : ''}`),
  markRead: (id) =>
    fetchJson(`/notifications/${id}/read`, {
      method: 'PATCH'
    }),
  markAllRead: (userId) =>
    fetchJson('/notifications/mark-all-read', {
      method: 'POST',
      body: JSON.stringify({ userId })
    }),
  getEmails: (recipientEmail) =>
    fetchJson(`/notifications/emails${recipientEmail ? `?recipientEmail=${recipientEmail}` : ''}`)
};
