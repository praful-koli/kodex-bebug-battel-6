class StateSynchronizer {
  constructor() {
    this.io = null;
  }

  init(io) {
    this.io = io;
  }

  sendMatchUpdate(roomId, matchState) {
    if (this.io) {
      this.io.to(`match:${roomId}`).emit('match-update', matchState);
    }
  }

  sendMatchCompleted(roomId, payload) {
    if (this.io) {
      this.io.to(`match:${roomId}`).emit('match-completed', payload);
    }
  }

  sendOpponentDisconnected(roomId, userId) {
    if (this.io) {
      this.io.to(`match:${roomId}`).emit('opponent-disconnected', { userId });
    }
  }

  sendPlayerReconnected(roomId, userId) {
    if (this.io) {
      this.io.to(`match:${roomId}`).emit('player-reconnected', { userId });
    }
  }

  sendOpponentLeft(roomId, message) {
    if (this.io) {
      this.io.to(`match:${roomId}`).emit('opponent-left', { message });
    }
  }
}

// Export singleton instance
export default new StateSynchronizer();
