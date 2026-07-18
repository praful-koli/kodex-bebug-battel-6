import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BoardCell from './BoardCell';

/* ─── Win-line overlay ──────────────────────────────────────────────────── */
const CELL_CENTERS = Array.from({ length: 9 }, (_, i) => ({
  x: (i % 3) * 33.333 + 16.667,
  y: Math.floor(i / 3) * 33.333 + 16.667,
}));

const WinLine = ({ combo }) => {
  const start = CELL_CENTERS[combo[0]];
  const end   = CELL_CENTERS[combo[2]];
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100" preserveAspectRatio="none">
      <motion.line
        x1={start.x} y1={start.y} x2={end.x} y2={end.y}
        stroke="#c97559" strokeWidth="3.5" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
};

export const BoardGrid = React.memo(({ board, winCombo, roundWinner, myMark, isMyTurn, onCellClick }) => {
  return (
    <div className="w-full aspect-square relative select-none">
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
        {board.map((cell, idx) => {
          const col = idx % 3, row = Math.floor(idx / 3);
          const isWinning = winCombo?.includes(idx) ?? false;
          const border = `${row < 2 ? 'border-b' : ''} ${col < 2 ? 'border-r' : ''} border-border`.trim();
          const canClick = !cell && !roundWinner && isMyTurn;

          return (
            <BoardCell
              key={idx}
              index={idx}
              value={cell}
              isWinning={isWinning}
              border={border}
              canClick={canClick}
              onClick={() => onCellClick(idx)}
            />
          );
        })}
      </div>
      <AnimatePresence>
        {winCombo && <WinLine key="wl" combo={winCombo} />}
      </AnimatePresence>
    </div>
  );
});

export default BoardGrid;
