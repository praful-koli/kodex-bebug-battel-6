import React from 'react';
import BoardGrid from './BoardGrid';

export const GameBoard = React.memo(({
  board,
  winCombo,
  roundWinner,
  myMark,
  isMyTurn,
  onCellClick,
  opponentConnected,
  connectionStatus,
}) => {
  const isDisconnected = connectionStatus !== 'connected' && connectionStatus !== 'recovered';
  const showOverlay = isDisconnected || !opponentConnected;

  return (
    <div className="flex-1 rounded-xl border border-border overflow-hidden bg-background relative">
      <BoardGrid
        board={board}
        winCombo={winCombo}
        roundWinner={roundWinner}
        myMark={myMark}
        isMyTurn={isMyTurn && !showOverlay} // Disable turn inputs during network drops
        onCellClick={onCellClick}
      />

      {/* Online/Connection Status Backdrop Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-[2.5px] flex flex-col items-center justify-center text-center p-6">
          {isDisconnected ? (
            <>
              <div className="relative flex items-center justify-center mb-3">
                <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-destructive/20 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
              </div>
              <p className="text-sm font-bold text-foreground">Connection Lost</p>
              <p className="text-xs text-muted-foreground mt-1 animate-pulse">
                {connectionStatus === 'reconnecting'
                  ? 'Reconnecting to match server...'
                  : 'Reconnection failed. Waiting for socket...'}
              </p>
            </>
          ) : (
            <>
              <div className="relative flex items-center justify-center mb-3">
                <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-warning/20 opacity-75" stroke="#c97559" />
                <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: '#c97559' }} />
              </div>
              <p className="text-sm font-bold text-foreground">Opponent Offline</p>
              <p className="text-xs text-muted-foreground mt-1 animate-pulse">
                Waiting for player to reconnect (15s)...
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
});

export default GameBoard;
