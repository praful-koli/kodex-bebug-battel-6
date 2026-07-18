class ConnectionManager {
  constructor() {
    this.socketToUser = new Map(); // socketId -> userId
    this.userToSocket = new Map(); // userId -> socketId
    this.disconnectTimeouts = new Map(); // matchId -> setTimeout reference
  }

  registerConnection(socketId, userId) {
    const cleanUserId = userId.toString();
    this.socketToUser.set(socketId, cleanUserId);
    this.userToSocket.set(cleanUserId, socketId);
  }

  removeConnection(socketId) {
    const userId = this.socketToUser.get(socketId);
    if (userId) {
      this.socketToUser.delete(socketId);
      // Only delete from userToSocket if this socketId is the active one mapped
      if (this.userToSocket.get(userId) === socketId) {
        this.userToSocket.delete(userId);
      }
    }
    return userId;
  }

  getSocketId(userId) {
    return this.userToSocket.get(userId.toString());
  }

  getUserId(socketId) {
    return this.socketToUser.get(socketId);
  }

  scheduleDisconnectTimeout(matchId, callback) {
    // Clear any existing disconnect timeout for this match first
    this.clearDisconnectTimeout(matchId);

    const timeout = setTimeout(() => {
      this.disconnectTimeouts.delete(matchId);
      callback();
    }, 15000); // 15-second grace period

    this.disconnectTimeouts.set(matchId, timeout);
  }

  clearDisconnectTimeout(matchId) {
    if (this.disconnectTimeouts.has(matchId)) {
      clearTimeout(this.disconnectTimeouts.get(matchId));
      this.disconnectTimeouts.delete(matchId);
      return true;
    }
    return false;
  }
}

// Export singleton instance
export default new ConnectionManager();
