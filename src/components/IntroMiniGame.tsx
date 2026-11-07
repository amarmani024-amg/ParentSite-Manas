import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound, triggerHaptic } from '../utils/audio';
import { Sparkles, ArrowRight } from 'lucide-react';

interface IntroMiniGameProps {
  onComplete: () => void;
  onStarTapFirstTime: () => void;
}

interface ConstellationPoint {
  id: number;
  label: string;
  x: number; // percentage
  y: number; // percentage
}

// 5 stars representing the 5 keys
const STARS: ConstellationPoint[] = [
  { id: 0, label: 'Origin', x: 25, y: 32 },
  { id: 1, label: 'Logic', x: 72, y: 26 },
  { id: 2, label: 'Cosmos', x: 50, y: 52 },
  { id: 3, label: 'Resolve', x: 28, y: 74 },
  { id: 4, label: 'Enigma', x: 74, y: 70 },
];

export default function IntroMiniGame({ onComplete, onStarTapFirstTime }: IntroMiniGameProps) {
  const [phase, setPhase] = useState<'loading' | 'title' | 'miniGame' | 'opening'>('loading');
  const [activeStarIndex, setActiveStarIndex] = useState<number>(0);
  const [tappedStars, setTappedStars] = useState<number[]>([]);

  // Phase 1: Cinematic loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('title');
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  const handleStartGame = () => {
    sound.playClick();
    triggerHaptic('light');
    setPhase('miniGame');
  };

  const handleStarClick = (index: number) => {
    if (index !== activeStarIndex) return; // Must tap the active star

    sound.playStarPing(index);
    triggerHaptic('light');

    if (tappedStars.length === 0) {
      onStarTapFirstTime();
    }

    const nextTapped = [...tappedStars, index];
    setTappedStars(nextTapped);

    if (nextTapped.length >= STARS.length) {
      // Finished!
      sound.playWhoosh();
      triggerHaptic('heavy');
      setPhase('opening');
      setTimeout(() => {
        onComplete();
      }, 1600);
    } else {
      setActiveStarIndex(nextTapped.length);
    }
  };

  const handleSkip = () => {
    sound.playWhoosh();
    triggerHaptic('medium');
    setPhase('opening');
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 overflow-hidden">
      <AnimatePresence mode="wait">
        {/* PHASE 1: Loading Intro */}
        {phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md px-6 py-10"
          >
            <div className="w-16 h-16 mx-auto mb-6 relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping" />
              <div className="w-10 h-10 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center cyan-box-glow">
                <Sparkles className="w-5 h-5 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
            </div>
            <motion.h2
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl font-semibold tracking-wide text-white mb-2"
            >
              Initializing something made just for you...
            </motion.h2>
            <p className="text-xs text-cyan-300/70 font-mono tracking-wider">
              CALIBRATING NEURAL FREQUENCIES
            </p>
          </motion.div>
        )}

        {/* PHASE 2: Title Screen */}
        {phase === 'title' && (
          <motion.div
            key="title"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-lg px-6 py-12 glass-panel rounded-3xl relative z-10 border border-cyan-400/30"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-medium tracking-widest uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Portal Access
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 cyan-glow">
              The Gateway
            </h1>

            <p className="text-lg md:text-xl text-cyan-100 font-light mb-8 max-w-md mx-auto leading-relaxed">
              Five doors. Five surprises. One final secret.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleStartGame}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-base shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[52px]"
              >
                <span>Wake the Gate</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={handleSkip}
                className="text-xs text-cyan-300/80 hover:text-cyan-200 underline underline-offset-4 py-2 transition-colors"
              >
                Skip directly to the Gateway
              </button>
            </div>
          </motion.div>
        )}

        {/* PHASE 3: Wake the Gate Mini Game */}
        {phase === 'miniGame' && (
          <motion.div
            key="miniGame"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col justify-between p-4 md:p-8"
          >
            {/* Top Instruction Header */}
            <div className="text-center pt-4 z-10">
              <div className="glass-panel inline-block px-5 py-2.5 rounded-full border border-cyan-400/40">
                <p className="text-sm md:text-base font-medium text-cyan-100">
                  Tap 5 glowing stars in the navy sky to awaken the Gate
                </p>
              </div>
              <p className="text-xs text-cyan-300/70 mt-2 font-mono">
                {tappedStars.length} of 5 stars aligned
              </p>
            </div>

            {/* Constellation Canvas Sky */}
            <div className="relative flex-1 w-full max-w-xl mx-auto my-4 min-h-[340px]">
              {/* Connecting lines between already tapped stars */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {tappedStars.map((starIdx, i) => {
                  if (i === 0) return null;
                  const prev = STARS[tappedStars[i - 1]];
                  const curr = STARS[starIdx];
                  return (
                    <motion.line
                      key={`line-${i}`}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.6 }}
                      transition={{ duration: 0.4 }}
                      x1={`${prev.x}%`}
                      y1={`${prev.y}%`}
                      x2={`${curr.x}%`}
                      y2={`${curr.y}%`}
                      stroke="#22d3ee"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  );
                })}
              </svg>

              {/* The 5 interactive stars */}
              {STARS.map((star, index) => {
                const isTapped = tappedStars.includes(index);
                const isActive = index === activeStarIndex;

                return (
                  <div
                    key={star.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${star.x}%`, top: `${star.y}%` }}
                  >
                    <button
                      onClick={() => handleStarClick(index)}
                      disabled={isTapped || !isActive}
                      className={`relative flex items-center justify-center min-w-[56px] min-h-[56px] rounded-full transition-all ${
                        isTapped
                          ? 'opacity-80 scale-90'
                          : isActive
                          ? 'cursor-pointer scale-110 active:scale-95'
                          : 'opacity-40 cursor-not-allowed'
                      }`}
                      aria-label={`Star ${index + 1}`}
                    >
                      {/* Active pulsing halo */}
                      {isActive && (
                        <>
                          <div className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping pointer-events-none" />
                          <div className="absolute -inset-2 rounded-full bg-cyan-400/20 blur-md animate-pulse pointer-events-none" />
                        </>
                      )}

                      {/* Star Core Button */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                          isTapped
                            ? 'bg-amber-400/20 border-amber-400 text-amber-300 gold-box-glow'
                            : isActive
                            ? 'bg-cyan-500/30 border-cyan-300 text-cyan-200 cyan-box-glow'
                            : 'bg-slate-800/40 border-slate-600/40 text-slate-400'
                        }`}
                      >
                        <Sparkles
                          className={`w-6 h-6 ${
                            isTapped ? 'text-amber-300' : isActive ? 'text-cyan-200 animate-spin' : 'text-slate-400'
                          }`}
                          style={{ animationDuration: '8s' }}
                        />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom Skip Control */}
            <div className="text-center pb-4 z-10">
              <button
                onClick={handleSkip}
                className="px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs text-slate-300 hover:text-white transition-colors"
              >
                Skip warm-up →
              </button>
            </div>
          </motion.div>
        )}

        {/* PHASE 4: Opening Cinematic Gate */}
        {phase === 'opening' && (
          <motion.div
            key="opening"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: [0.8, 1.3, 2.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="w-48 h-48 rounded-full border-4 border-cyan-400 bg-cyan-400/20 blur-xl animate-ping" />
            <h2 className="text-3xl font-bold text-white cyan-glow tracking-widest mt-6">
              THE GATEWAY OPENS
            </h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
