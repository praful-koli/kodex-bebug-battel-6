import axiosInstance from '@/api/axios';

/**
 * Raw API calls for auth endpoints.
 * Returns the full Axios response — services extract .data.
 */
const authApi = {
  signup: (data) => axiosInstance.post('/auth/signup', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  logout: () => axiosInstance.post('/auth/logout'),
  getMe: () => axiosInstance.get('/auth/me'),
};

export default authApi;
