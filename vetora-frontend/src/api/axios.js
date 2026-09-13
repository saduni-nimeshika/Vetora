import axios from 'axios';

// Auto-derive the backend URL from whatever host the frontend was loaded
// from — so opening the app via a LAN IP (e.g. http://192.168.1.5:5173) on
// a phone or another computer automatically talks to the backend at
// http://192.168.1.5:8080, with no manual configuration needed. A
// VITE_API_URL env var still overrides this for production, where the
// frontend and backend may live on entirely different domains.
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;