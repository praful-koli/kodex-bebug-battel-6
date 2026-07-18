export const registerConnectionEvents = (connectionManager, { onReconnect, onDisconnect }) => {
  const unsubConnect = connectionManager.subscribe('connect', () => {
    onReconnect?.();
  });

  const unsubDisconnect = connectionManager.subscribe('disconnect', () => {
    onDisconnect?.();
  });

  return () => {
    unsubConnect();
    unsubDisconnect();
  };
};
