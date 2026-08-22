import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT if present in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civicguard_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: On 401, clear token and redirect to /governmentdashboard
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('civicguard_token');
      localStorage.removeItem('civicguard_user');
      // Only redirect if not already on the login page
      if (window.location.pathname.startsWith('/governmentdashboard') && window.location.pathname !== '/governmentdashboard') {
        window.location.href = '/governmentdashboard';
      }
    }
    return Promise.reject(error);
  }
);
