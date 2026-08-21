import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token and optional apikey
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('futuretek_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const apiKey = import.meta.env.VITE_API_KEY;
    if (apiKey) {
      config.headers.apikey = apiKey;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if we are already on the login endpoint
      if (!error.config.url.includes('/admin/auth/login')) {
        localStorage.removeItem('futuretek_admin_token');
        localStorage.removeItem('futuretek_admin_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
