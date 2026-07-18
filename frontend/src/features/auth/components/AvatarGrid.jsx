import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const AvatarGrid = ({ avatars, selectedAvatar, onSelect }) => {
  return (
    <motion.div
      className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="popLayout">
        {avatars.map((avatar, index) => {
          const isSelected = selectedAvatar?.id === avatar.id;

          return (
            <motion.button
              key={avatar.id}
              type="button"
              onClick={() => onSelect(avatar)}
              className={cn(
                'relative aspect-square rounded-xl overflow-hidden border-2 transition-all',
                'hover:scale-110 hover:z-10',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isSelected
                  ? 'border-primary shadow-lg shadow-primary/30 scale-105 z-10'
                  : 'border-transparent hover:border-primary/30'
              )}
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
              transition={{
                duration: 0.3,
                delay: index * 0.015,
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              whileHover={{ 
                scale: 1.12,
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Avatar Image with playful background */}
              <div className={cn(
                'w-full h-full p-1.5 rounded-xl transition-colors',
                isSelected ? 'bg-primary/10' : 'bg-muted/50'
              )}>
                <img
                  src={avatar.url}
                  alt={`Avatar ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                  loading="lazy"
                />
              </div>

              {/* Selection Indicator with playful bounce */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    className="absolute -top-1 -right-1 bg-primary rounded-full p-1 shadow-lg ring-2 ring-background"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ 
                      scale: 1, 
                      rotate: 0,
                    }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{
                      type: 'spring',
                      stiffness: 600,
                      damping: 15,
                    }}
                  >
                    <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};

export default AvatarGrid;
