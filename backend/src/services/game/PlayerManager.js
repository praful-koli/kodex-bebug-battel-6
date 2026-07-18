class PlayerManager {
  constructor() {
    this.players = new Map(); // userId -> { socketId, username, fullName, avatar, status: 'idle' | 'playing', lastActive }
  }

  addPlayer(userId, playerData) {
    const cleanId = userId.toString();
    this.players.set(cleanId, {
      ...playerData,
      status: 'idle',
      lastActive: Date.now(),
    });
  }

  getPlayer(userId) {
    return this.players.get(userId.toString());
  }

  setPlayerStatus(userId, status) {
    const player = this.getPlayer(userId);
    if (player) {
      player.status = status;
    }
  }

  removePlayer(userId) {
    this.players.delete(userId.toString());
  }

  updateHeartbeat(userId, socketId = null) {
    const cleanId = userId.toString();
    const player = this.players.get(cleanId);
    if (player) {
      player.lastActive = Date.now();
      if (socketId) player.socketId = socketId;
    } else {
      this.players.set(cleanId, {
        socketId,
        status: 'idle',
        lastActive: Date.now(),
      });
    }
  }

  isOnline(userId) {
    const player = this.getPlayer(userId);
    if (!player) return false;
    // Considered online if heartbeat is within last 45 seconds
    return (Date.now() - player.lastActive) < 45000;
  }
}

// Export singleton instance
export default new PlayerManager();
