export const registerGameEvents = (connectionManager, { onMatchUpdate, onMatchCompleted }) => {
  const unsubMatchUpdate = connectionManager.subscribe('match-update', (updatedMatch) => {
    onMatchUpdate?.(updatedMatch);
  });

  const unsubMatchCompleted = connectionManager.subscribe('match-completed', ({ winner, match }) => {
    onMatchCompleted?.({ winner, match });
  });

  return () => {
    unsubMatchUpdate();
    unsubMatchCompleted();
  };
};
