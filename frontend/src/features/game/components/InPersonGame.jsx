import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useReducer, useState } from 'react';

/* ─── Constants ─────────────────────────────────────────────────────────── */
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const CELL_CENTERS = Array.from({ length: 9 }, (_, i) => ({
  x: (i % 3) * 33.333 + 16.667,
  y: Math.floor(i / 3) * 33.333 + 16.667,
}));

function detectWinner(board) {
  for (const combo of WIN_LINES) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return { winner: board[a], combo };
  }
  if (board.every(Boolean)) return { winner: 'draw', combo: null };
  return null;
}

/* ─── Reducer ───────────────────────────────────────────────────────────── */
const INITIAL = {
  board: Array(9).fill(null),
  isX: true,
  roundWinner: null,
  winCombo: null,
  scores: { X: 0, O: 0, draws: 0 },
  roundsPlayed: 0,
  matchWinner: null,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'CLICK': {
      if (state.board[action.idx] || state.roundWinner || state.matchWinner) return state;
      const next = [...state.board];
      next[action.idx] = state.isX ? 'X' : 'O';
      const result = detectWinner(next);
      return {
        ...state,
        board: next,
        isX: result ? state.isX : !state.isX,
        roundWinner: result?.winner ?? null,
        winCombo: result?.combo ?? null,
      };
    }
    case 'END_ROUND': {
      const { roundWinner, scores, roundsPlayed } = state;
      const newScores = { ...scores };
      if (roundWinner === 'draw') newScores.draws++;
      else if (roundWinner) newScores[roundWinner]++;
      const newRoundsPlayed = roundsPlayed + 1;

      if (newRoundsPlayed >= 3 && (newScores.X >= 2 || newScores.O >= 2)) {
        const matchWinner = newScores.X > newScores.O ? 'X' : 'O';
        return { ...state, scores: newScores, roundsPlayed: newRoundsPlayed, matchWinner };
      }

      return {
        ...state,
        board: Array(9).fill(null),
        isX: newRoundsPlayed % 2 === 0,
        roundWinner: null,
        winCombo: null,
        scores: newScores,
        roundsPlayed: newRoundsPlayed,
      };
    }
    default:
      return state;
  }
}

/* ─── Marks ─────────────────────────────────────────────────────────────── */
const XMark = ({ winning }) => (
  <motion.div
    className="w-3/5 h-3/5 flex items-center justify-center"
    initial={{ scale: 0, rotate: -20, opacity: 0 }}
    animate={{ scale: 1, rotate: 0, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 480, damping: 20 }}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full" overflow="visible">
      <line x1="15" y1="15" x2="85" y2="85"
        stroke={winning ? '#c97559' : '#1a1816'} strokeWidth="13" strokeLinecap="round" />
      <line x1="85" y1="15" x2="15" y2="85"
        stroke={winning ? '#c97559' : '#1a1816'} strokeWidth="13" strokeLinecap="round" />
    </svg>
  </motion.div>
);

const OMark = ({ winning }) => (
  <motion.div
    className="w-3/5 h-3/5 flex items-center justify-center"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 480, damping: 20 }}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full" overflow="visible">
      <circle cx="50" cy="50" r="36"
        fill="none" stroke="#c97559" strokeWidth="13" strokeLinecap="round" />
    </svg>
  </motion.div>
);

/* ─── Win-line ──────────────────────────────────────────────────────────── */
const WinLine = ({ combo }) => {
  const s = CELL_CENTERS[combo[0]], e = CELL_CENTERS[combo[2]];
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100" preserveAspectRatio="none">
      <motion.line
        x1={s.x} y1={s.y} x2={e.x} y2={e.y}
        stroke="#c97559" strokeWidth="3.5" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
};

/* ─── Board ─────────────────────────────────────────────────────────────── */
const Board = ({ board, winCombo, roundWinner, onCellClick }) => (
  <div className="w-full aspect-square relative select-none">
    <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
      {board.map((cell, idx) => {
        const col = idx % 3, row = Math.floor(idx / 3);
        const isWinning = winCombo?.includes(idx) ?? false;
        const border = `${row < 2 ? 'border-b' : ''} ${col < 2 ? 'border-r' : ''} border-border`.trim();
        return (
          <motion.button
            key={idx}
            onClick={() => onCellClick(idx)}
            disabled={!!cell || !!roundWinner}
            className={`relative flex items-center justify-center focus:outline-none ${border} ${
              !cell && !roundWinner ? 'cursor-pointer' : 'cursor-default'
            }`}
            animate={{ backgroundColor: isWinning ? 'rgba(201,117,89,0.07)' : 'transparent' }}
            transition={{ duration: 0.3 }}
            whileTap={!cell && !roundWinner ? { scale: 0.85 } : {}}
          >
            {!cell && !roundWinner && (
              <motion.div
                className="absolute inset-3 rounded-xl bg-foreground/4"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.12 }}
              />
            )}
            {cell === 'X' && <XMark winning={isWinning} />}
            {cell === 'O' && <OMark winning={isWinning} />}
          </motion.button>
        );
      })}
    </div>
    <AnimatePresence>
      {winCombo && <WinLine key="wl" combo={winCombo} />}
    </AnimatePresence>
  </div>
);

/* ─── Countdown ring ────────────────────────────────────────────────────── */
const CountdownRing = ({ seconds, total }) => {
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
};

/* ─── Score digit ───────────────────────────────────────────────────────── */
const ScoreDigit = ({ value }) => (
  <AnimatePresence mode="wait">
    <motion.span key={value}
      initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 14, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="inline-block tabular-nums"
    >{value}</motion.span>
  </AnimatePresence>
);

/* ─── Main Game ─────────────────────────────────────────────────────────── */
const AUTO_ADVANCE_SECS = 4;

const InPersonGame = ({ onClose }) => {
  const [state, dispatch] = useReducer(gameReducer, INITIAL);
  const { board, isX, scores, roundsPlayed, roundWinner, winCombo, matchWinner } = state;
  const [countdown, setCountdown] = useState(null);

  /* Auto-advance after round ends */
  useEffect(() => {
    if (!roundWinner) { setCountdown(null); return; }
    setCountdown(AUTO_ADVANCE_SECS);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) return null;
        if (prev <= 1) { clearInterval(interval); dispatch({ type: 'END_ROUND' }); return null; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [roundWinner]);

  /* Auto-close after match winner — 4s to read the screen */
  useEffect(() => {
    if (!matchWinner) return;
    const t = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(t);
  }, [matchWinner, onClose]);

  const currentMark = isX ? 'X' : 'O';
  const statusText = roundWinner
    ? roundWinner === 'draw' ? "It's a Draw" : `${roundWinner} Wins`
    : `${currentMark}'s Turn`;

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-md"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      />

      <div className="fixed inset-0 z-[70] flex items-center justify-center p-5 pointer-events-none">
        <motion.div
          className="pointer-events-auto w-full max-w-md bg-background rounded-2xl shadow-2xl"
          initial={{ scale: 0.88, y: 32, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.88, y: 32, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 pt-6 pb-3">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground/50 tracking-[0.18em] uppercase mb-0.5">
                In Person · Round {roundsPlayed + 1}
              </p>
              <h2 className="text-xl font-black text-foreground tracking-tight">Tic Tac Toe</h2>
            </div>

            {/* Win pips */}
            <div className="flex flex-col items-end gap-1.5">
              {[
                { label: 'X', count: scores.X, fill: 'bg-foreground' },
                { label: 'O', count: scores.O, fill: 'bg-primary' },
              ].map(({ label, count, fill }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-muted-foreground/40">{label}</span>
                  {[0, 1].map(i => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${count > i ? fill : 'bg-border'}`}
                      animate={{ scale: count === i + 1 ? [1, 1.5, 1] : 1 }}
                      transition={{ duration: 0.35 }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ── Status bar ── */}
          <div className="flex items-center justify-center gap-2.5 pb-3 px-6">
            <AnimatePresence mode="wait">
              <motion.span
                key={statusText}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.18 }}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
                  roundWinner === 'draw'
                    ? 'bg-muted text-muted-foreground'
                    : roundWinner
                    ? 'bg-foreground text-background'
                    : 'bg-muted/60 text-muted-foreground'
                }`}
              >
                {statusText}
              </motion.span>
            </AnimatePresence>

            <AnimatePresence>
              {countdown !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  className="relative flex items-center justify-center flex-shrink-0"
                >
                  <CountdownRing seconds={countdown} total={AUTO_ADVANCE_SECS} />
                  <span className="absolute text-[10px] font-bold text-muted-foreground">{countdown}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Main content area: board+score OR match winner ── */}
          <div className="px-6 pb-6 relative" style={{ minHeight: 320 }}>
            <AnimatePresence mode="wait">

              {/* Match winner — replaces board in-place */}
              {matchWinner ? (
                <motion.div
                  key="match-winner"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                >
                  <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground/50">
                    Match Winner
                  </p>
                  <motion.p
                    className="font-black tracking-tighter leading-none"
                    style={{ fontSize: 'clamp(5rem, 20vw, 7rem)', color: '#c97559' }}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 420, damping: 20 }}
                  >
                    {matchWinner}
                  </motion.p>
                  <motion.p
                    className="text-base font-semibold text-muted-foreground"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    wins the match
                  </motion.p>
                  <motion.p
                    className="text-[11px] font-mono text-muted-foreground/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                  >
                    closing in a moment…
                  </motion.p>
                </motion.div>

              ) : (
                /* Board + score column */
                <motion.div
                  key="board"
                  className="flex flex-col sm:flex-row items-stretch gap-3 h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Board */}
                  <div className="flex-1 rounded-xl border border-border overflow-hidden bg-background">
                    <Board
                      board={board}
                      winCombo={winCombo}
                      roundWinner={roundWinner}
                      onCellClick={(idx) => dispatch({ type: 'CLICK', idx })}
                    />
                  </div>

                  {/* Score column */}
                  <div className="flex sm:flex-col rounded-xl border border-border overflow-hidden bg-muted/40 w-full sm:w-20 flex-shrink-0">
                    {[
                      { label: 'X',    key: 'X',     accent: 'text-foreground' },
                      { label: 'Draw', key: 'draws', accent: 'text-muted-foreground' },
                      { label: 'O',    key: 'O',     accent: 'text-primary' },
                    ].map(({ label, key, accent }, i) => (
                      <div key={key}
                        className={`flex-1 flex flex-col items-center justify-center p-3 sm:p-0 ${
                          i > 0
                            ? 'border-t sm:border-t border-l sm:border-l-0 border-border'
                            : ''
                        }`}
                      >
                        <p className="text-[8px] font-mono tracking-widest uppercase text-muted-foreground/40 mb-1">
                          {label}
                        </p>
                        <span className={`text-2xl font-black leading-none ${accent}`}>
                          <ScoreDigit value={scores[key] ?? 0} />
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default InPersonGame;
