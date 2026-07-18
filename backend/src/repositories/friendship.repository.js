import Friendship from '../models/Friendship.js';

const friendshipRepository = {
  /**
   * Find any friendship between userA and userB.
   * Checks both directions.
   */
  findFriendship: (userA, userB) =>
    Friendship.findOne({
      $or: [
        { requester: userA, receiver: userB },
        { requester: userB, receiver: userA },
      ],
    }),

  /**
   * Find a friendship by specific requester and receiver.
   */
  findByRequesterAndReceiver: (requester, receiver) =>
    Friendship.findOne({ requester, receiver }),

  /**
   * Create a new pending friendship request.
   */
  createFriendship: (requester, receiver) =>
    Friendship.create({ requester, receiver, status: 'pending' }),

  /**
   * Update the status of a friendship request.
   */
  updateStatus: (id, status) =>
    Friendship.findByIdAndUpdate(id, { status }, { new: true }),

  /**
   * Delete/Remove a friendship request.
   */
  deleteFriendship: (id) =>
    Friendship.findByIdAndDelete(id),

  /**
   * List all pending requests received by a user.
   * Populates requester details.
   */
  findPendingRequestsReceivedBy: (userId) =>
    Friendship.find({ receiver: userId, status: 'pending' })
      .populate('requester', 'username fullName avatar isOnline lastActive'),

  /**
   * List all accepted friendships for a user.
   * Populates both requester and receiver details.
   */
  findAcceptedFriendships: (userId) =>
    Friendship.find({
      status: 'accepted',
      $or: [{ requester: userId }, { receiver: userId }],
    })
      .populate('requester', 'username fullName avatar isOnline lastActive')
      .populate('receiver', 'username fullName avatar isOnline lastActive'),
};

export default friendshipRepository;
