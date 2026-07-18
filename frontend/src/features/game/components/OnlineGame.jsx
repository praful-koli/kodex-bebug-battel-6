import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../providers/GameProvider';
import { useConnection } from '@/providers/SocketProvider';
import GameBoard from './GameBoard';

/* ─── Animated score digit ──────────────────────────────────────────────── */
const ScoreDigit = React.memo(({ value }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={value}
      initial={{ y: -14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 14, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="inline-block tabular-nums"
    >
      {value}
    </motion.span>
  </AnimatePresence>
));

/* ─── Countdown ring ────────────────────────────────────────────────────── */
const CountdownRing = React.memo(({ seconds, total = 4 }) => {
  const r = 13, circ = 2 * Math.PI * r;
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" className="rotate-[-90deg]">
      <circle cx="17" cy="17" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="2.5" />
      <motion.circle
        cx="17" cy="17" r={r} fill="none"
        stroke="#c97559" strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray={circ}
        animate={{ strokeDashoffset: circ * (1 - seconds / total) }}
        transition={{ duration: 0.95, ease: 'linear' }}
      />
    </svg>
  );
});

/* ─── Scores panel ──────────────────────────────────────────────────────── */
const ScorePanel = React.memo(({ isX, XScore, OScore, drawsScore }) => {
  return (
    <div className="flex sm:flex-col rounded-xl border border-border overflow-hidden bg-muted/40 w-full sm:w-20 flex-shrink-0">
      {[
        { label: isX ? 'You (X)' : 'Opp (X)', value: XScore, accent: 'text-foreground' },
        { label: 'Draws', value: drawsScore, accent: 'text-muted-foreground' },
        { label: !isX ? 'You (O)' : 'Opp (O)', value: OScore, accent: 'text-primary' },
      ].map(({ label, value, accent }, i) => (
        <div key={label}
          className={`flex-1 flex flex-col items-center justify-center p-3 sm:p-0 ${
            i > 0
              ? 'border-t sm:border-t border-l sm:border-l-0 border-border'
              : ''
          }`}
        >
          <p className="text-[8px] font-mono tracking-widest uppercase text-muted-foreground/40 mb-1 text-center px-1">
            {label}
          </p>
          <span className={`text-2xl font-black leading-none ${accent}`}>
            <ScoreDigit value={value} />
          </span>
        </div>
      ))}
    </div>
  );
});

/* ─── OnlineGame Container ──────────────────────────────────────────────── */
export const OnlineGame = ({ currentUser, onGameExit }) => {
  const {
    match,
    opponentConnected,
    countdown,
    finalWinner,
    leaving,
    loading,
    makeMove,
    leaveMatch,
  } = useGame();

  const connectionStatus = useConnection();

  if (loading || !match) {
    return (
      <div className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-md flex items-center justify-center">
        <div className="bg-background rounded-3xl p-8 max-w-sm text-center shadow-2xl border border-border">
          <p className="text-sm font-semibold text-foreground animate-pulse">
            Connecting to game server…
          </p>
        </div>
      </div>
    );
  }

  const isX = match.playerX._id.toString() === currentUser._id.toString();
  const myMark = isX ? 'X' : 'O';
  const isMyTurn = match.isXTurn === isX;

  const statusText = match.roundWinner
    ? match.roundWinner === 'draw'
      ? "It's a Draw"
      : match.roundWinner === myMark
      ? 'You Won the Round!'
      : 'Opponent Won the Round'
    : isMyTurn
    ? 'Your Turn'
    : "Opponent's Turn";

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[130] bg-black/55 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Game Window container */}
      <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <motion.div
          className="pointer-events-auto w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col relative"
          initial={{ scale: 0.88, y: 32, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.88, y: 32, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-2.5">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground/50 tracking-[0.18em] uppercase mb-0.5">
                Online Match · Round {match.roundsPlayed + 1}
              </p>
              <h2 className="text-xl font-black text-foreground tracking-tight">Tic Tac Toe</h2>
            </div>

            {/* Leave Game Button */}
            <button
              onClick={leaveMatch}
              disabled={leaving}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-destructive/20 hover:bg-destructive/10 text-destructive cursor-pointer transition-colors disabled:opacity-50"
            >
              Abandon
            </button>
          </div>

          {/* Status Display */}
          <div className="flex items-center justify-center gap-2.5 pb-2.5 px-6">
            <AnimatePresence mode="wait">
              <motion.span
                key={statusText}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.18 }}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
                  match.roundWinner === 'draw'
                    ? 'bg-muted text-muted-foreground'
                    : match.roundWinner
                    ? match.roundWinner === myMark
                      ? 'bg-emerald-500 text-white'
                      : 'bg-destructive text-destructive-foreground'
                    : isMyTurn
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted/60 text-muted-foreground'
                }`}
              >
                {statusText}
              </motion.span>
            </AnimatePresence>

            {/* Countdown ring */}
            <AnimatePresence>
              {countdown !== null && countdown > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  className="relative flex items-center justify-center flex-shrink-0"
                >
                  <CountdownRing seconds={countdown} total={4} />
                  <span className="absolute text-[10px] font-bold text-muted-foreground">{countdown}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Board + Scores */}
          <div className="px-6 pb-6 flex flex-col sm:flex-row items-stretch gap-4">
            <GameBoard
              board={match.board}
              winCombo={match.winCombo}
              roundWinner={match.roundWinner}
              myMark={myMark}
              isMyTurn={isMyTurn}
              onCellClick={makeMove}
              opponentConnected={opponentConnected}
              connectionStatus={connectionStatus}
            />

            <ScorePanel
              isX={isX}
              XScore={match.scores?.O ?? 0}
              OScore={match.scores?.X ?? 0}
              drawsScore={match.scores?.draws ?? 0}
            />
          </div>
        </motion.div>
      </div>

      {/* Match Completed screen */}
      <AnimatePresence>
        {finalWinner && (
          <motion.div
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm bg-background border border-border rounded-3xl p-8 text-center shadow-2xl"
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
            >
              <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground/50 mb-2">
                Tournament Done
              </p>
              <h2 className="text-xl font-bold text-foreground mb-4">Match Finished</h2>

              <div className="py-6 flex flex-col items-center gap-1">
                <span className="text-6xl font-black" style={{ color: '#c97559' }}>
                  {finalWinner._id.toString() !== currentUser._id.toString() ? 'YOU' : 'OPP'}
                </span>
                <span className="text-xs text-muted-foreground/60 font-mono mt-1">
                  wins the tournament!
                </span>
              </div>

              <button
                onClick={onGameExit}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                Close Arena
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OnlineGame;
