import friendshipRepository from '../repositories/friendship.repository.js';
import userRepository from '../repositories/user.repository.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import User from '../models/User.js';

const ONLINE_THRESHOLD_MS = 45000; // 45 seconds

const friendshipService = {
  /**
   * Send a friend request by username.
   */
  sendFriendRequest: async (requesterId, targetUsername) => {
    const cleanUsername = targetUsername.trim().toLowerCase();

    // 1. Find user by username
    const receiver = await userRepository.findOneByUsername(cleanUsername);
    if (!receiver) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `User @${targetUsername} not found`);
    }

    const receiverId = receiver._id.toString();

    // 2. Cannot add yourself
    if (receiverId === requesterId.toString()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You cannot send a friend request to yourself');
    }

    // 3. Check if friendship already exists
    const existing = await friendshipRepository.findFriendship(requesterId, receiverId);

    if (existing) {
      if (existing.status === 'accepted') {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, `You are already friends with @${targetUsername}`);
      }
      if (existing.status === 'pending') {
        if (existing.requester.toString() === requesterId.toString()) {
          throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Friend request already sent');
        } else {
          // If the other user already sent a request, auto-accept it!
          existing.status = 'accepted';
          await existing.save();
          return { friendship: existing, message: `Auto-accepted pending request from @${targetUsername}!` };
        }
      }
      // If declined, update back to pending and reset requester to me
      if (existing.status === 'declined') {
        existing.status = 'pending';
        existing.requester = requesterId;
        existing.receiver = receiverId;
        await existing.save();
        return { friendship: existing, message: 'Friend request sent successfully' };
      }
    }

    // 4. Create new request
    const friendship = await friendshipRepository.createFriendship(requesterId, receiverId);
    return { friendship, message: 'Friend request sent successfully' };
  },

  /**
   * Respond to friend request (accept or decline).
   */
  respondToRequest: async (receiverId, requesterId, action) => {
    if (!['accept', 'decline'].includes(action)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid action. Must be accept or decline');
    }

    // Find the pending request sent by requesterId to receiverId
    const friendship = await friendshipRepository.findByRequesterAndReceiver(requesterId, receiverId);

    if (!friendship || friendship.status !== 'pending') {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Pending friend request not found');
    }

    if (action === 'accept') {
      friendship.status = 'accepted';
      await friendship.save();
      return friendship;
    } else {
      // Decline: delete the document so they can invite again later if they want
      await friendshipRepository.deleteFriendship(friendship._id);
      return null;
    }
  },

  /**
   * Get all accepted friends with dynamic online status check.
   */
  getFriendsList: async (userId) => {
    const list = await friendshipRepository.findAcceptedFriendships(userId);
    const threshold = new Date(Date.now() - ONLINE_THRESHOLD_MS);

    return list.map(item => {
      // The friend is the side that is not the logged-in userId
      const friendObj = item.requester._id.toString() === userId.toString()
        ? item.receiver
        : item.requester;

      const userJson = friendObj.toJSON();
      const isOnline = userJson.lastActive && new Date(userJson.lastActive) > threshold;

      return {
        id: userJson._id,
        username: userJson.username,
        fullName: userJson.fullName,
        avatar: userJson.avatar,
        online: false,
        activity: userJson.activity || 'idle',
      };
    });
  },

  /**
   * Get incoming pending requests.
   */
  getPendingRequests: async (userId) => {
    const list = await friendshipRepository.findPendingRequestsReceivedBy(userId);
    return list.map(item => ({
      id: item.requester._id,
      username: item.requester.username,
      fullName: item.requester.fullName,
      avatar: item.requester.avatar,
    }));
  },

  /**
   * Update current user heartbeat online status.
   */
  updateHeartbeat: async (userId) => {
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastActive: new Date(),
    });
    return { success: true };
  },
};

export default friendshipService;
