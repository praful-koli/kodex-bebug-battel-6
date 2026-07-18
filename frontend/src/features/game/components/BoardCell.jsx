import React from 'react';
import { motion } from 'framer-motion';

/* ─── X mark ────────────────────────────────────────────────────────────── */
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

/* ─── O mark ────────────────────────────────────────────────────────────── */
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

// BoardCell memoized to prevent re-renders unless values change
export const BoardCell = React.memo(({ index, value, isWinning, border, canClick, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={!canClick}
      className={`relative flex items-center justify-center focus:outline-none ${border} ${
        canClick ? 'cursor-pointer' : 'cursor-default'
      }`}
      animate={{ backgroundColor: isWinning ? 'rgba(201,117,89,0.07)' : 'transparent' }}
      transition={{ duration: 0.3 }}
      whileTap={canClick ? { scale: 0.85 } : {}}
    >
      {canClick && (
        <motion.div
          className="absolute inset-3 rounded-xl bg-foreground/4"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.12 }}
        />
      )}
      {value === 'X' && <XMark winning={isWinning} />}
      {value === 'O' && <OMark winning={isWinning} />}
    </motion.button>
  );
}, (prevProps, nextProps) => {
  // Deep props comparison to skip rendering if unchanged
  return prevProps.value === nextProps.value &&
         prevProps.isWinning === nextProps.isWinning &&
         prevProps.canClick === nextProps.canClick &&
         prevProps.border === nextProps.border;
});

export default BoardCell;
