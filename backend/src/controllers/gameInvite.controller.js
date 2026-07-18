import gameInviteService from '../services/gameInvite.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

const gameInviteController = {
  invite: async (req, res, next) => {
    try {
      const { receiverId } = req.body;
      const senderId = req.user.userId;

      const invite = await gameInviteService.invitePlayer(senderId, receiverId);

      res
        .status(HTTP_STATUS.CREATED)
        .json(ApiResponse(HTTP_STATUS.CREATED, invite, 'Game invitation sent'));
    } catch (error) {
      next(error);
    }
  },

  respond: async (req, res, next) => {
    try {
      const { inviteId, action } = req.body; // action: 'accept' | 'reject'
      const userId = req.user.userId;

      const result = await gameInviteService.respondToInvite(userId, inviteId, action);

      res
        .status(HTTP_STATUS.OK)
        .json(ApiResponse(HTTP_STATUS.OK, result, result.message));
    } catch (error) {
      next(error);
    }
  },

  getPending: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const invites = await gameInviteService.getPendingInvites(userId);

      res
        .status(HTTP_STATUS.OK)
        .json(ApiResponse(HTTP_STATUS.OK, invites, 'Pending invites fetched'));
    } catch (error) {
      next(error);
    }
  },

  leave: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const result = await gameInviteService.leaveGame(userId);

      res
        .status(HTTP_STATUS.OK)
        .json(ApiResponse(HTTP_STATUS.OK, result, 'Left game match'));
    } catch (error) {
      next(error);
    }
  },

  getActiveMatch: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const match = await gameInviteService.getActiveMatch(userId);

      if (!match) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(ApiResponse(HTTP_STATUS.NOT_FOUND, null, 'No active match found'));
      }

      res
        .status(HTTP_STATUS.OK)
        .json(ApiResponse(HTTP_STATUS.OK, match, 'Active match fetched successfully'));
    } catch (error) {
      next(error);
    }
  },
};

export default gameInviteController;
