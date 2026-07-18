import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AvatarGrid from './AvatarGrid';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const StepThree = ({
  avatars,
  selectedAvatar,
  onSelectAvatar,
  onRegenerate,
  onBack,
  onFinish,
  isSubmitting,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Choose your avatar</h2>
        <p className="text-muted-foreground">
          Pick an avatar that represents you
        </p>
      </div>

      {/* Avatar Grid */}
      <div className="mb-8">
        <AvatarGrid
          avatars={avatars}
          selectedAvatar={selectedAvatar}
          onSelect={onSelectAvatar}
        />
      </div>

      {/* Regenerate Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onRegenerate}
          disabled={isSubmitting}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate More Avatars
        </Button>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3"
      >
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onBack}
          disabled={isSubmitting}
          size="lg"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={onFinish}
          disabled={!selectedAvatar || isSubmitting}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="text-primary-foreground" />
              Creating account...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Finish
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default StepThree;
