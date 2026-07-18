import axiosInstance from '@/api/axios';

const friendsApi = {
  sendRequest: (username) => axiosInstance.post('/friends/request', { username }),
  respondToRequest: (requesterId, action) => axiosInstance.post('/friends/respond', { requesterId, action }), // action: 'accept' | 'decline'
  getFriends: () => axiosInstance.get('/friends'),
  getPending: () => axiosInstance.get('/friends/pending'),
  heartbeat: () => axiosInstance.post('/friends/heartbeat'),
};

export default friendsApi;
