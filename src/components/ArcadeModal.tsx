import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound, triggerHaptic } from '../utils/audio';
import { X, Gamepad2, Sparkles, RefreshCw, Trophy } from 'lucide-react';

interface ArcadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAchievement: (id: string) => void;
}

interface FallingStar {
  id: number;
  x: number; // percentage 10% to 90%
  y: number; // px from top
  speed: number;
  size: number;
  color: string;
}

const MEMORY_COLORS = [
  { id: 0, label: 'Cyan', bg: 'bg-cyan-500', border: 'border-cyan-300', glow: 'cyan-box-glow', note: 0 },
  { id: 1, label: 'Gold', bg: 'bg-amber-400', border: 'border-amber-200', glow: 'gold-box-glow', note: 2 },
  { id: 2, label: 'Indigo', bg: 'bg-indigo-500', border: 'border-indigo-300', glow: 'shadow-indigo-500/50', note: 4 },
  { id: 3, label: 'Emerald', bg: 'bg-emerald-400', border: 'border-emerald-200', glow: 'shadow-emerald-400/50', note: 5 },
];

export default function ArcadeModal({ isOpen, onClose, onAchievement }: ArcadeModalProps) {
  const [activeTab, setActiveTab] = useState<'catcher' | 'memory'>('catcher');

  // GAME A: Star Catcher State
  const [catcherScore, setCatcherScore] = useState(0);
  const [stars, setStars] = useState<FallingStar[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // GAME B: Memory Orbs State
  const [sequence, setSequence] = useState<number[]>([0, 1, 3, 2]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [activeOrbIndex, setActiveOrbIndex] = useState<number | null>(null);
  const [memoryWon, setMemoryWon] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Watch the sequence...');

  // Star Catcher Game Loop
  useEffect(() => {
    if (!isOpen || activeTab !== 'catcher') return;

    let starId = 0;
    const spawnInterval = setInterval(() => {
      setStars((prev) => [
        ...prev.slice(-15), // keep max 15 on screen
        {
          id: ++starId,
          x: 10 + Math.random() * 80,
          y: -20,
          speed: 1.2 + Math.random() * 1.5,
          size: 24 + Math.random() * 16,
          color: Math.random() > 0.4 ? '#38bdf8' : '#fbbf24',
        },
      ]);
    }, 900);

    const moveInterval = setInterval(() => {
      setStars((prev) =>
        prev
          .map((s) => ({ ...s, y: s.y + s.speed }))
          .filter((s) => s.y < 380)
      );
    }, 30);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [isOpen, activeTab]);

  const handleCatchStar = (id: number) => {
    sound.playStarPing(Math.floor(Math.random() * 5));
    triggerHaptic('light');

    setStars((prev) => prev.filter((s) => s.id !== id));
    const nextScore = catcherScore + 1;
    setCatcherScore(nextScore);

    if (nextScore >= 5) {
      onAchievement('arcade_star');
    }
  };

  // Memory Orbs sequence player
  const playSequence = (seq: number[] = sequence) => {
    setIsPlayingSeq(true);
    setPlayerInput([]);
    setMemoryWon(false);
    setStatusMessage('Observe closely...');

    seq.forEach((orbIdx, i) => {
      setTimeout(() => {
        setActiveOrbIndex(orbIdx);
        sound.playStarPing(MEMORY_COLORS[orbIdx].note);
        setTimeout(() => {
          setActiveOrbIndex(null);
          if (i === seq.length - 1) {
            setIsPlayingSeq(false);
            setStatusMessage('Your turn: repeat the pattern');
          }
        }, 350);
      }, (i + 1) * 600);
    });
  };

  useEffect(() => {
    if (isOpen && activeTab === 'memory') {
      const timer = setTimeout(() => {
        playSequence();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab]);

  const handleOrbPress = (index: number) => {
    if (isPlayingSeq || memoryWon) return;

    sound.playStarPing(MEMORY_COLORS[index].note);
    triggerHaptic('light');

    setActiveOrbIndex(index);
    setTimeout(() => setActiveOrbIndex(null), 200);

    const nextInput = [...playerInput, index];
    setPlayerInput(nextInput);

    // Validate so far
    const step = nextInput.length - 1;
    if (nextInput[step] !== sequence[step]) {
      // Mistake - friendly feedback
      sound.playError();
      setStatusMessage('Almost! Tap "Replay" to see it again.');
      setPlayerInput([]);
      return;
    }

    // Finished sequence!
    if (nextInput.length === sequence.length) {
      sound.playUnlock();
      triggerHaptic('celebrate');
      setMemoryWon(true);
      setStatusMessage('Pattern solved! Neural resonance synced.');
      onAchievement('memory_matrix');
    }
  };

  const handleGenerateNewMemory = () => {
    sound.playClick();
    const newSeq = [
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
    ];
    setSequence(newSeq);
    playSequence(newSeq);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-lg glass-panel rounded-3xl p-6 md:p-8 relative border border-cyan-400/30 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-cyan-300" />
              <h2 className="text-xl font-bold text-white tracking-wide">
                Cosmic Arcade
              </h2>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex p-1 bg-slate-900/60 rounded-xl mb-6 border border-slate-800">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('catcher');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'catcher'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Star Catcher
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('memory');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'memory'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Memory Orbs
            </button>
          </div>

          {/* TAB 1: Star Catcher */}
          {activeTab === 'catcher' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Tap the falling stars · No timer, zero stress</span>
                <span className="font-mono text-cyan-300 font-bold">
                  Stars Caught: {catcherScore}
                </span>
              </div>

              {/* Falling Stars Arena */}
              <div
                ref={containerRef}
                className="relative w-full h-[320px] rounded-2xl bg-slate-950/70 border border-cyan-500/20 overflow-hidden"
              >
                {stars.map((star) => (
                  <button
                    key={star.id}
                    onClick={() => handleCatchStar(star.id)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 p-2 cursor-pointer active:scale-90 transition-transform"
                    style={{
                      left: `${star.x}%`,
                      top: `${star.y}px`,
                    }}
                    aria-label="Catch Star"
                  >
                    <Sparkles
                      className="animate-spin"
                      style={{
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        color: star.color,
                        animationDuration: '6s',
                        filter: `drop-shadow(0 0 8px ${star.color})`,
                      }}
                    />
                  </button>
                ))}

                {catcherScore >= 5 && (
                  <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs flex items-center justify-center gap-2">
                    <Trophy className="w-4 h-4" />
                    <span>Achievement unlocked: Star Hunter</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Memory Orbs */}
          {activeTab === 'memory' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-medium text-cyan-200">
                  {statusMessage}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Step {playerInput.length} of {sequence.length}
                </p>
              </div>

              {/* 4 Orbs Grid */}
              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto my-6">
                {MEMORY_COLORS.map((orb) => {
                  const isLit = activeOrbIndex === orb.id;
                  return (
                    <button
                      key={orb.id}
                      onClick={() => handleOrbPress(orb.id)}
                      disabled={isPlayingSeq}
                      className={`h-24 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                        orb.border
                      } ${
                        isLit
                          ? `${orb.bg} scale-105 shadow-xl`
                          : 'bg-slate-900/80 hover:bg-slate-800/80 opacity-70'
                      }`}
                    >
                      <Sparkles
                        className={`w-8 h-8 ${isLit ? 'text-white' : 'text-slate-400'}`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Memory Controls */}
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => playSequence()}
                  disabled={isPlayingSeq}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Replay Sequence
                </button>
                <button
                  onClick={handleGenerateNewMemory}
                  disabled={isPlayingSeq}
                  className="px-4 py-2 rounded-xl bg-cyan-600/40 hover:bg-cyan-600/60 border border-cyan-400/40 text-xs text-cyan-200 transition-colors"
                >
                  New Pattern
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
