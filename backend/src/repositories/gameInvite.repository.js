import GameInvite from '../models/GameInvite.js';

const gameInviteRepository = {
  createInvite: (sender, receiver) =>
    GameInvite.create({ sender, receiver, status: 'pending' }),

  findInviteById: (id) =>
    GameInvite.findById(id),

  /**
   * Find a pending, active invite between a sender and receiver.
   * Excludes expired ones (TTL auto-deletes, but we can check Date threshold to be safe).
   */
  findPendingInvite: (sender, receiver) => {
    const threshold = new Date(Date.now() - 5 * 60 * 1000);
    return GameInvite.findOne({
      sender,
      receiver,
      status: 'pending',
      createdAt: { $gte: threshold },
    });
  },

  /**
   * List pending, unexpired invites received by a user.
   */
  findPendingInvitesForUser: (userId) => {
    const threshold = new Date(Date.now() - 5 * 60 * 1000);
    return GameInvite.find({
      receiver: userId,
      status: 'pending',
      createdAt: { $gte: threshold },
    }).populate('sender', 'username fullName avatar');
  },

  updateInviteStatus: (id, status) =>
    GameInvite.findByIdAndUpdate(id, { status }, { new: true }),

  deleteInvite: (id) =>
    GameInvite.findByIdAndDelete(id),
};

export default gameInviteRepository;
