import User from '../../models/User.js';
import PlayerManager from './PlayerManager.js';
import RoomManager from './RoomManager.js';
import Match from '../../models/Match.js';

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board) {
  for (const combo of WIN_LINES) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo };
    }
  }
  if (board.every(Boolean)) return { winner: 'draw', combo: null };
  return null;
}

class GameManager {
  constructor() {
    this.games = new Map(); // roomId -> game state
  }

  /**
   * Initialize a new game room state.
   * Fetches user profile data from DB *once* on init for name/avatar display.
   */
  async initGame(roomId, playerXId, playerOId) {
    const [userX, userO] = await Promise.all([
      User.findById(playerXId).select('username fullName avatar'),
      User.findById(playerOId).select('username fullName avatar'),
    ]);

    const game = {
      _id: roomId,
      players: [userX, userO],
      playerX: userX,
      playerO: userO,
      board: Array(9).fill(null),
      isXTurn: true,
      scores: { X: 0, O: 0, draws: 0 },
      roundsPlayed: 0,
      roundWinner: null,
      winCombo: null,
      status: 'active',
      roundTimer: null,
    };

    this.games.set(roomId, game);
    
    // Set status to playing in PlayerManager
    PlayerManager.setPlayerStatus(playerXId, 'playing');
    PlayerManager.setPlayerStatus(playerOId, 'playing');

    return game;
  }

  getGameState(roomId) {
    return this.games.get(roomId);
  }

  /**
   * Make a move on the board.
   * Returns { game, roundEnded, matchEnded, finalWinner }
   */
  async makeMove(roomId, userId, cellIndex) {
    const game = this.games.get(roomId);
    if (!game || game.status !== 'active') return null;

    // Verify cell is empty and no round winner is set
    if (game.board[cellIndex] || game.roundWinner) return null;

    const isPlayerX = game.playerX._id.toString() === userId.toString();
    const isPlayerO = game.playerO._id.toString() === userId.toString();

    // Apply mark
    const mark = game.isXTurn ? 'X' : 'O';
    game.board[cellIndex] = mark;

    const winResult = checkWinner(game.board);
    let roundEnded = false;
    let matchEnded = false;
    let finalWinner = null;

    if (winResult) {
      roundEnded = true;
      game.roundWinner = winResult.winner;
      game.winCombo = winResult.combo;
      game.roundsPlayed += 1;

      if (winResult.winner === 'draw') {
        game.scores.draws += 1;
      } else {
        game.scores.X += 1;
      }

      // Check if match winner decided (first to 2 wins)
      if (game.scores.X >= 2) {
        matchEnded = true;
        finalWinner = game.playerX;
      } else if (game.scores.O >= 2) {
        matchEnded = true;
        finalWinner = game.playerO;
      }

      if (matchEnded) {
        game.status = 'completed';
        
        // Complete the room
        RoomManager.completeRoom(roomId);

        // PERSIST the finished match history log to MongoDB Atlas/local
        try {
          await Match.create({
            players: [game.playerX._id, game.playerO._id],
            playerX: game.playerX._id,
            playerO: game.playerO._id,
            board: game.board,
            isXTurn: game.isXTurn,
            scores: game.scores,
            roundsPlayed: game.roundsPlayed,
            roundWinner: game.roundWinner,
            winCombo: game.winCombo,
            status: 'completed',
          });
        } catch (e) {
          console.error('Failed to log completed match history to DB', e);
        }
      }
    } else {
    }

    return { game, roundEnded, matchEnded, finalWinner };
  }

  /**
   * Reset board state for a new round.
   */
  resetRound(roomId, startingMark) {
    const game = this.games.get(roomId);
    if (!game || game.status !== 'active') return null;

    game.board = Array(9).fill(null);
    game.roundWinner = null;
    game.isXTurn = startingMark === 'X';

    return game;
  }

  /**
   * Terminate active game (e.g. abandonment).
   */
  async abortGame(roomId) {
    const game = this.games.get(roomId);
    if (game && game.status === 'active') {
      game.status = 'completed';
      
      // Reset statuses to idle
      PlayerManager.setPlayerStatus(game.playerX._id, 'idle');
      PlayerManager.setPlayerStatus(game.playerO._id, 'idle');
      
      // Complete room
      RoomManager.completeRoom(roomId);

      // Persist aborted match history
      try {
        await Match.create({
          players: [game.playerX._id, game.playerO._id],
          playerX: game.playerX._id,
          playerO: game.playerO._id,
          board: game.board,
          isXTurn: game.isXTurn,
          scores: game.scores,
          roundsPlayed: game.roundsPlayed,
          roundWinner: game.roundWinner,
          winCombo: game.winCombo,
          status: 'completed',
        });
      } catch (e) {
        console.error('Failed to log aborted match to DB', e);
      }
    }
  }

  deleteGame(roomId) {
    this.games.delete(roomId);
  }
}

// Export singleton instance
export default new GameManager();
