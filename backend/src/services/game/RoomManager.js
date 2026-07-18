import { v4 as uuidv4 } from 'uuid';

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> { roomId, players: [player1Id, player2Id], status: 'active' | 'completed' }
  }

  createRoom(player1Id, player2Id) {
    const roomId = uuidv4();
    const room = {
      roomId,
      players: [player1Id.toString(), player2Id.toString()],
      status: 'active',
      createdAt: Date.now(),
    };
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  findActiveRoomForUser(userId) {
    const cleanId = userId.toString();
    for (const room of this.rooms.values()) {
      if (room.players.includes(cleanId)) {
        return room;
      }
    }
    return null;
  }

  completeRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.status = 'completed';
    }
  }

  deleteRoom(roomId) {
    this.rooms.delete(roomId);
  }
}

// Export singleton instance
export default new RoomManager();
