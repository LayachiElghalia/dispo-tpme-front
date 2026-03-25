// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tpme_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tpme_token');
      window.location.href = '/espace';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────
export const authService = {
  login:    (email, motDePasse) => api.post('/auth/login',    { email, motDePasse }),
  register: (data)              => api.post('/auth/register', data),
  me:       ()                  => api.get('/auth/me'),
};

// ── Demandes ─────────────────────────────────────────────────
export const demandeService = {
  simuler:      (payload) => api.post('/demandes/simuler', payload),
  creer:        (data)    => api.post('/demandes', data),
  soumettre:    (id)      => api.put(`/demandes/${id}/soumettre`),
  mesDemandes:  ()        => api.get('/demandes/mes-demandes'),
  getById:      (id)      => api.get(`/demandes/${id}`),
  uploadDoc:    (id, type, file) => {
    const fd = new FormData();
    fd.append('type', type);
    fd.append('file', file);
    return api.post(`/demandes/${id}/documents`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ── CRI ───────────────────────────────────────────────────────
export const criService = {
  getAll: () => api.get('/cri'),
};