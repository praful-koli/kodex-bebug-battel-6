/** Base API URL — proxied through Vite dev server in development */
const PRODUCTION_BACKEND_URL = 'https://kodex-bebug-battel-6.onrender.com';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? `${PRODUCTION_BACKEND_URL}/api` : '/api');

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.PROD ? PRODUCTION_BACKEND_URL : 'http://localhost:5000');

export const APP_NAME = 'AuthKit';
