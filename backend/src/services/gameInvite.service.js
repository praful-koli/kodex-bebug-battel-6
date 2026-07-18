import gameInviteRepository from '../repositories/gameInvite.repository.js';
import userRepository from '../repositories/user.repository.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import User from '../models/User.js';
import RoomManager from './game/RoomManager.js';
import GameManager from './game/GameManager.js';
import PlayerManager from './game/PlayerManager.js';
import ConnectionManager from './game/ConnectionManager.js';
import StateSynchronizer from './game/StateSynchronizer.js';

const ONLINE_THRESHOLD_MS = 45000;

const gameInviteService = {
  /**
   * Send a game invite to a friend.
   */
  invitePlayer: async (senderId, receiverId) => {
    // 1. Fetch sender and receiver
    const [sender, receiver] = await Promise.all([
      userRepository.findById(senderId),
      userRepository.findById(receiverId),
    ]);

    if (!sender) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sender not found');
    }
    if (!receiver) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Receiver user not found');
    }

    // 2. Prevent inviting yourself
    if (senderId.toString() === receiverId.toString()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You cannot invite yourself to play');
    }

    const receiverLastActive = receiver.lastActive ? new Date(receiver.lastActive).getTime() : 0;
    const isReceiverOnline = (Date.now() - receiverLastActive) < ONLINE_THRESHOLD_MS;

    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Player is offline and cannot accept invitations');

    // 4. Verify neither is currently playing
    if (sender.activity === 'playing') {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You are already in an active game');
    }
    if (receiver.activity === 'playing') {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Friend is currently playing another match');
    }

    // 5. Create pending invite
    const invite = await gameInviteRepository.createInvite(senderId, receiverId);
    return invite;
  },

  /**
   * Respond to an invite (accept/reject).
   */
  respondToInvite: async (userId, inviteId, action) => {
    if (!['accept', 'reject'].includes(action)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid response action');
    }

    const invite = await gameInviteRepository.findInviteById(inviteId);
    if (!invite || invite.status !== 'accepted') {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Invitation not found or no longer active');
    }

    // Verify user is actually the recipient of the invite
    if (invite.receiver.toString() !== userId.toString()) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You are not authorized to respond to this invite');
    }

    // Verify invite is not expired (5 minutes threshold)
    const isExpired = new Date(invite.createdAt) < new Date(Date.now() - 5 * 60 * 1000);
    if (isExpired) {
      invite.status = 'rejected'; // Mark as rejected/expired
      await invite.save();
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This invitation has expired');
    }

    if (action === 'reject') {
      await gameInviteRepository.deleteInvite(inviteId);
      return { success: true, message: 'Invitation declined' };
    }

    // Action is 'accept'
    // Ensure both are still idle (not playing elsewhere)
    const [sender, receiver] = await Promise.all([
      userRepository.findById(invite.sender),
      userRepository.findById(invite.receiver),
    ]);

    if (sender.activity === 'playing') {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Sender is already in another game');
    }
    if (receiver.activity === 'playing') {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You are already in another game');
    }

    // Create the in-memory match room and game states
    const room = RoomManager.createRoom(invite.sender, invite.receiver);
    const game = await GameManager.initGame(room.roomId, invite.sender, invite.receiver);

    // Set both status to playing in DB
    sender.activity = 'playing';
    receiver.activity = 'playing';
    await Promise.all([sender.save(), receiver.save()]);

    // Fast-path: emit socket event to sender so they transition to playing state immediately
    const senderSocketId = ConnectionManager.getSocketId(invite.sender);
    if (senderSocketId && StateSynchronizer.io) {
      StateSynchronizer.io.to(senderSocketId).emit('invite-accepted', { matchId: room.roomId });
    }

    invite.status = 'accepted';
    await invite.save();

    return {
      success: true,
      message: 'Invitation accepted!',
      matchId: room.roomId,
      match: {
        opponent: sender.toJSON(),
      },
    };
  },

  /**
   * Get all pending invites for the user.
   */
  getPendingInvites: async (userId) => {
    const list = await gameInviteRepository.findPendingInvitesForUser(userId);
    return list;
  },

  /**
   * Leave game match state.
   */
  leaveGame: async (userId) => {
    // Reset user to idle in DB and PlayerManager
    await User.findByIdAndUpdate(userId, { activity: 'idle' });
    PlayerManager.setPlayerStatus(userId, 'idle');
    
    // Find active room and abort in-memory
    const activeRoom = RoomManager.findActiveRoomForUser(userId);
    if (activeRoom) {
      ConnectionManager.clearDisconnectTimeout(activeRoom.roomId);
      
      const wasActive = activeRoom.status === 'active';
      if (wasActive) {
        await GameManager.abortGame(activeRoom.roomId);
        StateSynchronizer.sendOpponentLeft(activeRoom.roomId, 'Opponent has left the game');

        // Reset the other player in DB only if it was an active match abandonment
        const opponentId = activeRoom.players.find(p => p.toString() !== userId.toString());
        if (opponentId) {
          await User.findByIdAndUpdate(opponentId, { activity: 'idle' });
          PlayerManager.setPlayerStatus(opponentId, 'idle');
        }
      }

      // Cleanup room from memory once both players are idle
      const opponentId = activeRoom.players.find(p => p.toString() !== userId.toString());
      const opponentStatus = PlayerManager.getPlayer(opponentId)?.status || 'idle';
      if (opponentStatus === 'idle') {
        RoomManager.deleteRoom(activeRoom.roomId);
        GameManager.deleteGame(activeRoom.roomId);
      }
    }
    return { success: true };
  },

  /**
   * Get the current active match for a user.
   */
  getActiveMatch: async (userId) => {
    const activeRoom = RoomManager.findActiveRoomForUser(userId);
    if (!activeRoom) return null;
    return GameManager.getGameState(activeRoom.roomId);
  },
};

export default gameInviteService;
