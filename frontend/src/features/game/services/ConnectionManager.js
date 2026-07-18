import socket from '@/lib/socket';

class ConnectionManager {
  constructor() {
    this.statusListeners = new Set();
    this.status = 'disconnected'; // 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'recovered' | 'failed'
    this.activeRoomId = null;

    // Bind core socket lifecycle events
    socket.on('connect', () => {
      const isRecovery = this.status === 'reconnecting';
      this.updateStatus(isRecovery ? 'recovered' : 'connected');
      
      // Automatic room recovery on reconnect
      if (this.activeRoomId) {
        console.log(`♻️ Recovering match room: ${this.activeRoomId}`);
        this.emit('join-match', { matchId: this.activeRoomId });
      }
    });

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // Disconnected by server, do not auto-reconnect
        this.updateStatus('disconnected');
      } else {
        // Disconnected due to connection drop, socket will auto-reconnect
        this.updateStatus('disconnected');
      }
    });

    socket.on('connect_error', () => {
      if (socket.active) {
        this.updateStatus('reconnecting');
      } else {
        this.updateStatus('failed');
      }
    });

    socket.on('reconnect_attempt', () => {
      this.updateStatus('reconnecting');
    });

    socket.on('reconnect_failed', () => {
      this.updateStatus('failed');
    });
  }

  connect() {
    const token = localStorage.getItem('accessToken');
    socket.auth = { token };
    
    if (!socket.connected) {
      this.updateStatus('connecting');
      socket.connect();
    }
  }

  disconnect() {
    this.activeRoomId = null;
    socket.disconnect();
    this.updateStatus('disconnected');
  }

  setActiveRoom(roomId) {
    this.activeRoomId = roomId;
  }

  getActiveRoom() {
    return this.activeRoomId;
  }

  emit(event, data) {
    if (!socket.connected) {
      console.warn(`⚠️ Cannot emit "${event}": Socket is not connected`);
      return false;
    }
    socket.emit(event, data);
    return true;
  }

  subscribe(event, callback) {
    socket.on(event, callback);
    return () => socket.off(event, callback);
  }

  unsubscribe(event, callback) {
    socket.off(event, callback);
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    // Call immediately with current status
    callback(this.status);
    return () => this.statusListeners.delete(callback);
  }

  updateStatus(newStatus) {
    if (this.status !== newStatus) {
      console.log(`📡 Socket connection status: ${this.status} -> ${newStatus}`);
      this.status = newStatus;
      this.statusListeners.forEach((callback) => callback(newStatus));
    }
  }
}

// Export singleton instance
export default new ConnectionManager();
