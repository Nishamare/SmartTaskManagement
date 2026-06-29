import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject({ message, status: error.response?.status });
  }
);

// ── Auth ──────────────────────────────────
export const authAPI = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  getMe:          ()     => api.get('/auth/me'),
  updateProfile:  (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  searchUsers:    (search) => api.get('/auth/users', { params: { search } }),
};

// ── Projects ──────────────────────────────
export const projectAPI = {
  getAll:      (params) => api.get('/projects', { params }),
  getById:     (id)     => api.get(`/projects/${id}`),
  getStats:    ()       => api.get('/projects/stats'),
  create:      (data)   => api.post('/projects', data),
  update:      (id, data) => api.put(`/projects/${id}`, data),
  delete:      (id)     => api.delete(`/projects/${id}`),
  addMember:   (id, data) => api.post(`/projects/${id}/members`, data),
  removeMember:(id, userId) => api.delete(`/projects/${id}/members/${userId}`),
};

// ── Tasks ─────────────────────────────────
export const taskAPI = {
  getByProject: (projectId, params) => api.get(`/tasks/project/${projectId}`, { params }),
  getMyTasks:   (params) => api.get('/tasks/my', { params }),
  getById:      (id)     => api.get(`/tasks/${id}`),
  create:       (projectId, data) => api.post(`/tasks/project/${projectId}`, data),
  update:       (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  delete:       (id)     => api.delete(`/tasks/${id}`),
  addComment:   (id, comment) => api.post(`/tasks/${id}/comments`, { comment }),
};

// ── Notifications ─────────────────────────
export const notificationAPI = {
  getAll:   () => api.get('/tasks/notifications'),
  markRead: () => api.patch('/tasks/notifications/read'),
};

export default api;