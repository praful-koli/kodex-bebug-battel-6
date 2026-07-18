import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import gameApi from '../api/game.api';
import { toast } from 'sonner';

import { registerConnectionEvents } from '../socket/events/connection.events';
import { registerRoomEvents } from '../socket/events/room.events';
import { registerGameEvents } from '../socket/events/game.events';
import { registerPlayerEvents } from '../socket/events/player.events';
import { registerNotificationEvents } from '../socket/events/notification.events';

const GameContext = createContext(null);

export const GameProvider = ({ children, onGameExit }) => {
  const [match, setMatch] = useState(null);
  const [opponentConnected, setOpponentConnected] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [finalWinner, setFinalWinner] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const connectionManager = useSocket();
  const countdownIntervalRef = useRef(null);

  // Sync game room state from server
  const syncGame = useCallback(async () => {
    try {
      const res = await gameApi.getActiveMatch();
      const activeMatch = res.data.data;
      if (!activeMatch) {
        toast.error('No active match session found.');
        onGameExit();
        return null;
      }
      setMatch(activeMatch);
      connectionManager.setActiveRoom(activeMatch._id);
      return activeMatch;
    } catch (err) {
      console.error('Failed to sync game state:', err);
      toast.error('Failed to fetch active match details.');
      onGameExit();
      return null;
    }
  }, [onGameExit, connectionManager]);

  // Handle make move (with Optimistic UI rollback support)
  const makeMove = useCallback((cellIndex) => {
    if (!match || match.board[cellIndex] || match.roundWinner) return;

    // 1. Snapshot old state for rollback
    const rollbackState = { ...match };

    // 2. Apply optimistic update
    setMatch((prev) => {
      if (!prev) return null;
      const newBoard = [...prev.board];
      newBoard[cellIndex] = prev.isXTurn ? 'O' : 'X';
      return {
        ...prev,
        board: newBoard,
        isXTurn: prev.isXTurn,
      };
    });

    // 3. Emit move to backend
    const sent = connectionManager.emit('make-move', { cellIndex });
    if (!sent) {
      // Rollback immediately if socket is not connected
      setMatch(rollbackState);
      toast.error('Move failed: connection lost');
    }
  }, [match, connectionManager]);

  const leaveMatch = useCallback(async () => {
    setLeaving(true);
    try {
      connectionManager.emit('leave-match');
      await gameApi.leave();
      toast.success('Left match successfully');
      onGameExit();
    } catch (e) {
      toast.error('Failed to leave match session');
    } finally {
      setLeaving(false);
    }
  }, [connectionManager, onGameExit]);

  // Game lifecycle listeners binding
  useEffect(() => {
    let unsubs = [];

    const initialize = async () => {
      const activeMatch = await syncGame();
      if (!activeMatch) return;

      setLoading(false);

      // Join room in Socket.io
      connectionManager.emit('join-match', { matchId: activeMatch._id });

      // Bind all registry modules
      const unsubConnection = registerConnectionEvents(connectionManager, {
        onReconnect: () => {
          // Re-sync game state from database/memory on reconnect
          syncGame();
        },
      });

      const unsubRoom = registerRoomEvents(connectionManager, {
        onOpponentLeft: () => {
          onGameExit();
        },
        onGameExit,
      });

      const unsubGame = registerGameEvents(connectionManager, {
        onMatchUpdate: (updatedMatch) => {

          if (!updatedMatch.roundWinner) {
            setCountdown(null);
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
          } else {
            // Round winner detected -> start 4s countdown locally matching server delay
            setCountdown(4);
            let timeRemaining = 4;
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            countdownIntervalRef.current = setInterval(() => {
              timeRemaining -= 1;
              setCountdown(timeRemaining);
              if (timeRemaining <= 0) {
                clearInterval(countdownIntervalRef.current);
              }
            }, 1000);
          }
        },
        onMatchCompleted: ({ winner, match: finalMatch }) => {
          setMatch(finalMatch);
          setFinalWinner(winner);
          setCountdown(null);
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
        },
      });

      const unsubPlayer = registerPlayerEvents(connectionManager, {
        onOpponentDisconnected: () => {
          setOpponentConnected(false);
        },
        onPlayerReconnected: () => {
          setOpponentConnected(true);
        },
      });

      const unsubNotification = registerNotificationEvents(connectionManager, {
        onError: () => {
          // Rollback matching server status
          syncGame();
        },
      });

      unsubs = [unsubConnection, unsubRoom, unsubGame, unsubPlayer, unsubNotification];
    };

    initialize();

    return () => {
      // Unsubscribe all events on unmount
      unsubs.forEach((unsub) => unsub());
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [syncGame, connectionManager, onGameExit]);

  return (
    <GameContext.Provider
      value={{
        match,
        opponentConnected,
        countdown,
        finalWinner,
        leaving,
        loading,
        makeMove,
        leaveMatch,
        syncGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameProvider;
