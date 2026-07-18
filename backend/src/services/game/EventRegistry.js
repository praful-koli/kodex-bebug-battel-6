import { verifyAccessToken } from '../../utils/jwt.js';
import ConnectionManager from './ConnectionManager.js';
import PlayerManager from './PlayerManager.js';
import RoomManager from './RoomManager.js';
import GameManager from './GameManager.js';
import StateSynchronizer from './StateSynchronizer.js';

export const registerSocketEvents = (io) => {
  // Initialize StateSynchronizer with the global io instance
  StateSynchronizer.init(io);

  // Authenticate socket connection
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`🔌 Socket connected: User ${userId} (${socket.id})`);

    // Register active connection mapping
    ConnectionManager.registerConnection(socket.id, userId);
    
    // Update player presence online status
    PlayerManager.updateHeartbeat(userId, socket.id);

    // ─── 1. JOIN MATCH ───
    socket.on('join-match', async ({ matchId }) => {
      const room = RoomManager.getRoom(matchId);
      if (!room || room.status !== 'active') {
        socket.emit('error', { message: 'Match room not found or inactive' });
        return;
      }

      // Verify user is in the room
      if (!room.players.includes(userId.toString())) {
        socket.emit('error', { message: 'You are not a player in this match' });
        return;
      }

      socket.join(`match:${matchId}`);
      socket.matchId = matchId;
      console.log(`👤 User ${userId} joined room match:${matchId}`);

      // Clear any pending disconnect grace timeouts for this room
      const cleared = ConnectionManager.clearDisconnectTimeout(matchId);
      if (cleared) {
        console.log(`♻️ User ${userId} reconnected. Cleared abort timeout for match:${matchId}`);
        // Notify room that user has reconnected
        StateSynchronizer.sendPlayerReconnected(matchId, userId);
      }

    });

    // ─── 2. MAKE MOVE ───
    socket.on('make-move', async ({ cellIndex }) => {
      const matchId = socket.matchId;
      if (!matchId) return;

      const result = await GameManager.makeMove(matchId, userId, cellIndex);
      if (!result) return;

      const { game, roundEnded, matchEnded, finalWinner } = result;

      // Broadcast move update immediately
      StateSynchronizer.sendMatchUpdate(matchId, game);

      // Handle round completed
      if (roundEnded) {
        if (matchEnded) {
          // Match finished (someone won 2 rounds)
          StateSynchronizer.sendMatchCompleted(matchId, {
            winner: finalWinner,
            match: game,
          });
        } else {
          // Schedule round reset in 4 seconds
          setTimeout(() => {
            const currentGame = GameManager.getGameState(matchId);
            if (!currentGame || currentGame.status !== 'active') return;

            // Alternates starting mark after each round regardless of win/draw/loss
            const startingMark = game.roundsPlayed % 2 === 0 ? 'X' : 'O';
            GameManager.resetRound(matchId, startingMark);
            
            // Broadcast clean board
            StateSynchronizer.sendMatchUpdate(matchId, currentGame);
          }, 4000);
        }
      }
    });

    // ─── 3. LEAVE MATCH (ABANDON) ───
    socket.on('leave-match', async () => {
      const matchId = socket.matchId;
      if (!matchId) return;

      ConnectionManager.clearDisconnectTimeout(matchId);
      await GameManager.abortGame(matchId);
      StateSynchronizer.sendOpponentLeft(matchId, 'Opponent has abandoned the match');
    });

    // ─── 4. DISCONNECT (GRACE TIMEOUT) ───
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: User ${userId}`);
      const matchId = socket.matchId;

      ConnectionManager.removeConnection(socket.id);

      if (matchId) {
        const game = GameManager.getGameState(matchId);
        if (game && game.status === 'active') {
          // Notify opponent that the player disconnected temporarily
          StateSynchronizer.sendOpponentDisconnected(matchId, userId);

          // Schedule a 15-second grace period
          ConnectionManager.scheduleDisconnectTimeout(matchId, async () => {
            console.log(`⏳ Grace period expired. Aborting match:${matchId}`);
            await GameManager.abortGame(matchId);
            StateSynchronizer.sendOpponentLeft(matchId, 'Opponent disconnected permanently');
          });
        }
      }
    });
  });
};

export default registerSocketEvents;
