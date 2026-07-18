import friendshipService from '../services/friendship.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

const friendshipController = {
  sendRequest: async (req, res, next) => {
    try {
      const { username } = req.body;
      const requesterId = req.user.userId;

      const { friendship, message } = await friendshipService.sendFriendRequest(requesterId, username);

      res
        .status(HTTP_STATUS.OK)
        .json(ApiResponse(HTTP_STATUS.OK, friendship, message));
    } catch (error) {
      next(error);
    }
  },

  respondToRequest: async (req, res, next) => {
    try {
      const { requesterId, action } = req.body; // action: 'accept' | 'decline'
      const receiverId = req.user.userId;

      const friendship = await friendshipService.respondToRequest(receiverId, requesterId, action);
      const msg = action === 'accept' ? 'Friend request accepted' : 'Friend request declined';

      res
        .status(HTTP_STATUS.OK)
        .json(ApiResponse(HTTP_STATUS.OK, friendship, msg));
    } catch (error) {
      next(error);
    }
  },

  getFriends: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const friends = await friendshipService.getFriendsList(userId);

      res
        .status(HTTP_STATUS.OK)
        .json(ApiResponse(HTTP_STATUS.OK, friends, 'Friends fetched successfully'));
    } catch (error) {
      next(error);
    }
  },

  getPending: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const pending = await friendshipService.getPendingRequests(userId);

      res
        .status(HTTP_STATUS.OK)
        .json(ApiResponse(HTTP_STATUS.OK, pending, 'Pending requests fetched successfully'));
    } catch (error) {
      next(error);
    }
  },

  heartbeat: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      await friendshipService.updateHeartbeat(userId);

      res
        .status(HTTP_STATUS.OK)
        .json(ApiResponse(HTTP_STATUS.OK, null, 'Heartbeat acknowledged'));
    } catch (error) {
      next(error);
    }
  },
};

export default friendshipController;
