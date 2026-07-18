import axiosInstance from '@/api/axios';

const gameApi = {
  invite: (receiverId) => axiosInstance.post('/game/invite', { receiverId }),
  respond: (inviteId, action) => axiosInstance.post('/game/invite/respond', { inviteId, action }), // action: 'accept' | 'reject'
  getPending: () => axiosInstance.get('/game/invites/pending'),
  leave: () => axiosInstance.post('/game/leave'),
  getActiveMatch: () => axiosInstance.get('/game/match/active'),
};

export default gameApi;
