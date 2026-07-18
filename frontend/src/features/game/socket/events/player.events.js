import { toast } from 'sonner';

export const registerPlayerEvents = (connectionManager, { onOpponentDisconnected, onPlayerReconnected }) => {
  const unsubDisconnected = connectionManager.subscribe('opponent-disconnected', ({ userId }) => {
    toast.warning('Opponent disconnected. Waiting for reconnect...');
    onOpponentDisconnected?.(userId);
  });

  const unsubReconnected = connectionManager.subscribe('player-reconnected', ({ userId }) => {
    toast.success('Opponent reconnected!');
    onPlayerReconnected?.(userId);
  });

  return () => {
    unsubDisconnected();
    unsubReconnected();
  };
};
