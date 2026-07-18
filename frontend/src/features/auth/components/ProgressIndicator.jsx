import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { number: 1, label: 'Account' },
  { number: 2, label: 'Personal Info' },
  { number: 3, label: 'Avatar' },
];

const ProgressIndicator = ({ currentStep }) => {
  return (
    <div className="w-full mb-8">
      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isUpcoming = currentStep < step.number;

          return (
            <div key={step.number} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <motion.div
                className={cn(
                  'relative flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2 transition-colors',
                  isCompleted && 'bg-primary border-primary',
                  isCurrent && 'border-primary bg-background',
                  isUpcoming && 'border-muted bg-background'
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </motion.div>
                ) : (
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      isCurrent && 'text-primary',
                      isUpcoming && 'text-muted-foreground'
                    )}
                  >
                    {step.number}
                  </span>
                )}
              </motion.div>

              {/* Step Label */}
              <motion.span
                className={cn(
                  'text-xs sm:text-sm font-medium text-center transition-colors',
                  (isCompleted || isCurrent) && 'text-foreground',
                  isUpcoming && 'text-muted-foreground'
                )}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.1 }}
              >
                {step.label}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
