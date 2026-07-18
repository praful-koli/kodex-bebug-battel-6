import axios from 'axios';
import { store } from '@/store';
import { selectAccessToken, clearCredentials } from '@/store/authSlice';
import { API_BASE_URL } from '@/config';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Automatically attaches the access token from Redux store to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = selectAccessToken(store.getState());
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// Clears auth state on 401 responses (expired / invalid token)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(clearCredentials());
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
