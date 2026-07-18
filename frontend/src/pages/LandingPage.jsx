import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useScreenSize } from "@/components/hooks/use-screen-size";
import { PixelTrail } from "@/components/ui/pixel-trail";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  const navigate = useNavigate();
  const screenSize = useScreenSize();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  return (
    <div className="relative w-full min-h-screen h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Pixel Trail Effect */}
      <div className="absolute inset-0 z-0">
        <PixelTrail
          pixelSize={screenSize.lessThan("md") ? 48 : 80}
          fadeDuration={0}
          delay={1200}
          pixelClassName="rounded-full bg-primary/20"
        />
      </div>

      {/* Header Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute top-8 left-8 md:top-12 md:left-12 z-10 pointer-events-none"
      >
        <p className="text-[10px] md:text-xs font-mono tracking-[0.3em] uppercase text-foreground/40">
          Classic Game
        </p>
      </motion.div>

      {/* Year/Version Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute top-8 right-8 md:top-12 md:right-12 z-10 pointer-events-none"
      >
        <p className="text-[10px] md:text-xs font-mono tracking-wider text-foreground/40">
          2025 // MULTIPLAYER
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 py-12 pointer-events-none">
        {/* Main Typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mb-6 md:mb-8 max-w-5xl"
        >
          <h1 className="text-6xl sm:text-7xl md:text-[10rem] lg:text-[13rem] font-black tracking-tighter leading-[0.85]">
            TIC<br/>
            <span className="text-primary">TAC</span><br/>
            TOE
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mb-10 md:mb-12 max-w-md"
        >
          <p className="text-sm md:text-base text-foreground/50 leading-relaxed">
            Two players. Nine squares.<br/>
            The timeless battle of strategy and wit.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="pointer-events-auto"
        >
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="px-12 py-6 md:px-14 md:py-7 text-base md:text-lg font-semibold rounded-none hover:scale-105 transition-transform duration-200"
          >
            Start Game
          </Button>
        </motion.div>
      </div>

      {/* Bottom Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="absolute bottom-8 left-8 md:bottom-12 md:left-12 z-10 pointer-events-none"
      >
        <p className="text-[10px] md:text-xs text-foreground/30 leading-relaxed max-w-xs">
          Simplicity in form.<br/>
          Every move counts.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.1 }}
        className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-10 pointer-events-none"
      >
        <p className="text-[10px] md:text-xs font-mono text-foreground/30">
          Made with ❤️
        </p>
      </motion.div>

    </div>
  );
};

export default LandingPage;
