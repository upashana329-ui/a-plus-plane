import { getToken, clearSession } from '../utils/storage';
import { API_BASE_URL } from '../utils/constants';

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export async function apiRequest(path, options = {}) {
  const token =
    getToken() ||
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('aplus_plane_token') : null) ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${cleanPath}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof unauthorizedHandler === 'function') {
          unauthorizedHandler('Your session has expired. Please log in again.');
        } else {
          clearSession();
        }
      }

      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) {
      throw err;
    }
    const networkError = new Error(
      'Unable to connect to the A+ Plane server. Please verify your connection or check if the backend service is running.'
    );
    networkError.status = 0;
    throw networkError;
  }
}

export const authApi = {
  register: (student) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(student),
    }),

  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getProfile: () => apiRequest('/student/profile'),
};

export const studentApi = {
  getProfile: () => apiRequest('/student/profile'),
  getDashboard: () => apiRequest('/student/dashboard'),
};

export const complaintsApi = {
  create: (data) =>
    apiRequest('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listMy: () => apiRequest('/complaints/my'),

  getById: (id) => apiRequest(`/complaints/${encodeURIComponent(id)}`),

  reopen: (id) =>
    apiRequest(`/complaints/${encodeURIComponent(id)}/reopen`, {
      method: 'POST',
    }),

  adminOverview: () => apiRequest('/admin/overview'),

  adminListAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/complaints${query ? `?${query}` : ''}`);
  },

  adminUpdateStatus: (id, status, resolutionNote) =>
    apiRequest(`/admin/complaints/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNote }),
    }),

  adminAssign: (id, staffName) =>
    apiRequest(`/admin/complaints/${encodeURIComponent(id)}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ staffName }),
    }),
};

export const busApi = {
  getRoutes: () => apiRequest('/bus/routes'),
  getMyAssignments: () => apiRequest('/bus/my-assignments'),
  assignRoute: (routeId) =>
    apiRequest('/bus/assignments', {
      method: 'POST',
      body: JSON.stringify({ routeId }),
    }),
  createRoute: (data) =>
    apiRequest('/bus/routes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addStop: (routeId, data) =>
    apiRequest(`/bus/routes/${encodeURIComponent(routeId)}/stops`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addSchedule: (routeId, data) =>
    apiRequest(`/bus/routes/${encodeURIComponent(routeId)}/schedules`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  // Bus transit grievance system
  submitComplaint: (data) =>
    apiRequest('/bus/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyComplaints: () => apiRequest('/bus/my-complaints'),
  adminGetComplaints: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/bus/complaints${query ? `?${query}` : ''}`);
  },
  adminUpdateStatus: (id, status, adminRemarks) =>
    apiRequest(`/bus/complaints/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminRemarks }),
    }),
};

export const hostelApi = {
  getHostels: () => apiRequest('/hostels'),
  getRequests: () => apiRequest('/hostels/requests'),
  submitRequest: (data) =>
    apiRequest('/hostels/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createHostel: (data) =>
    apiRequest('/hostels', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addRoom: (hostelId, data) =>
    apiRequest(`/hostels/${encodeURIComponent(hostelId)}/rooms`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateRequestStatus: (requestId, status) =>
    apiRequest(`/hostels/requests/${encodeURIComponent(requestId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

export const lostFoundApi = {
  list: (search = '', status = 'ALL', category = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'ALL') params.append('status', status);
    if (category) params.append('category', category);
    const qs = params.toString();
    return apiRequest(`/lost-found${qs ? `?${qs}` : ''}`);
  },
  create: (data) =>
    apiRequest('/lost-found', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStatus: (id, status) =>
    apiRequest(`/lost-found/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

export const subjectsApi = {
  list: (semester) => {
    const qs = semester ? `?semester=${encodeURIComponent(semester)}` : '';
    return apiRequest(`/subjects${qs}`);
  },
  create: (data) =>
    apiRequest('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const safetyApi = {
  create: (data) =>
    apiRequest('/safety/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  listMy: () => apiRequest('/safety/my-complaints'),
  adminList: () => apiRequest('/safety/admin/complaints'),
};

export const aiApi = {
  chat: (message) =>
    apiRequest('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};

export default apiRequest;
