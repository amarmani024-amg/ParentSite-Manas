import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound, triggerHaptic } from '../utils/audio';
import { cosmicFX } from './CosmicStarfield';
import { Sparkles, Trophy, RotateCcw, Compass, ArrowRight } from 'lucide-react';

interface FinalSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetAll: () => void;
  onCompleted: () => void;
}

interface TargetSlot {
  id: number;
  letter: string;
  x: number; // percentage
  y: number; // percentage
  assignedStar: number | null;
}

const INITIAL_SLOTS: TargetSlot[] = [
  { id: 0, letter: 'M', x: 15, y: 35, assignedStar: null },
  { id: 1, letter: 'A', x: 32, y: 65, assignedStar: null },
  { id: 2, letter: 'N', x: 50, y: 25, assignedStar: null },
  { id: 3, letter: 'A', x: 68, y: 65, assignedStar: null },
  { id: 4, letter: 'S', x: 85, y: 35, assignedStar: null },
];

export default function FinalSecretModal({
  isOpen,
  onClose,
  onResetAll,
  onCompleted,
}: FinalSecretModalProps) {
  const [phase, setPhase] = useState<'alignGame' | 'merging' | 'message'>('alignGame');
  const [slots, setSlots] = useState<TargetSlot[]>(INITIAL_SLOTS);
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const [availableStars, setAvailableStars] = useState<number[]>([0, 1, 2, 3, 4]);

  const finaleTriggeredRef = useRef(false);

  // Check if all stars placed
  useEffect(() => {
    const allPlaced = slots.every((s) => s.assignedStar !== null);
    if (allPlaced && phase === 'alignGame' && !finaleTriggeredRef.current) {
      finaleTriggeredRef.current = true;
      sound.playFanfare();
      triggerHaptic('celebrate');
      cosmicFX.fireworks(6);
      cosmicFX.confetti(120);
      onCompleted();

      // Advance to merging phase
      setTimeout(() => {
        setPhase('merging');
      }, 1000);

      // Advance to final emotional message card
      setTimeout(() => {
        setPhase('message');
        cosmicFX.fireworks(4);
      }, 3600);
    }
  }, [slots, phase, onCompleted]);

  // Tap-to-assign assist (ultra easy & thumb-friendly)
  const handleSelectStar = (starId: number) => {
    sound.playClick();
    triggerHaptic('light');
    setSelectedStar(starId);
  };

  const handleSlotClick = (slotId: number) => {
    if (selectedStar === null) {
      // Auto-assign first available star if user taps an empty slot
      const nextStar = availableStars[0];
      if (nextStar !== undefined) {
        assignStarToSlot(nextStar, slotId);
      }
      return;
    }

    assignStarToSlot(selectedStar, slotId);
  };

  const assignStarToSlot = (starId: number, slotId: number) => {
    sound.playStarPing(slotId);
    triggerHaptic('medium');

    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === slotId) {
          return { ...slot, assignedStar: starId };
        }
        return slot;
      })
    );

    setAvailableStars((prev) => prev.filter((id) => id !== starId));
    setSelectedStar(null);
  };

  const handleAutoAlign = () => {
    sound.playWhoosh();
    triggerHaptic('medium');
    setSlots((prev) =>
      prev.map((slot, idx) => ({
        ...slot,
        assignedStar: idx,
      }))
    );
    setAvailableStars([]);
    setSelectedStar(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          className="w-full max-w-xl glass-panel-gold rounded-3xl p-6 md:p-8 relative border border-amber-400/40 text-center my-auto"
        >
          {/* PHASE 1: Align the Stars Game */}
          {phase === 'alignGame' && (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wider uppercase">
                <Compass className="w-3.5 h-3.5" />
                The Final Chamber
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight gold-glow">
                  Align the Stars
                </h2>
                <p className="text-sm text-amber-100/90 mt-1">
                  Place the five celestial keys into their constellation anchors.
                </p>
              </div>

              {/* Constellation Canvas Interactive Zone */}
              <div className="relative w-full h-[260px] md:h-[280px] rounded-2xl bg-slate-950/60 border border-amber-400/20 overflow-hidden my-4">
                {/* Constellation lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <polyline
                    points="15%,35% 32%,65% 50%,25% 68%,65% 85%,35%"
                    fill="none"
                    stroke="rgba(251, 191, 36, 0.4)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>

                {/* 5 Target Constellation Slots */}
                {slots.map((slot) => {
                  const hasStar = slot.assignedStar !== null;
                  return (
                    <div
                      key={slot.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                    >
                      <button
                        onClick={() => handleSlotClick(slot.id)}
                        disabled={hasStar}
                        className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all cursor-pointer ${
                          hasStar
                            ? 'bg-amber-400/30 border-amber-300 text-white gold-box-glow scale-105'
                            : selectedStar !== null
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200 animate-pulse'
                            : 'bg-slate-900/70 border-slate-700 text-slate-400 hover:border-amber-400/60'
                        }`}
                      >
                        {hasStar ? (
                          <Sparkles className="w-6 h-6 text-amber-200 animate-spin" style={{ animationDuration: '9s' }} />
                        ) : (
                          <span className="text-xs font-mono font-bold text-amber-300">
                            {slot.letter}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Available Star Keys to place */}
              {availableStars.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-amber-200/80">
                    {selectedStar !== null
                      ? 'Now tap a glowing constellation slot above!'
                      : 'Tap a star key below, or tap an anchor to place:'}
                  </p>
                  <div className="flex justify-center gap-3">
                    {availableStars.map((starId) => (
                      <button
                        key={starId}
                        onClick={() => handleSelectStar(starId)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                          selectedStar === starId
                            ? 'bg-amber-400 border-white text-slate-950 scale-110 shadow-lg'
                            : 'bg-amber-500/20 border-amber-400/50 text-amber-300 hover:scale-105'
                        }`}
                      >
                        <Sparkles className="w-5 h-5 text-amber-200" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Assist: Auto Align button */}
              <div className="pt-2">
                <button
                  onClick={handleAutoAlign}
                  className="text-xs text-amber-300/80 hover:text-amber-100 underline underline-offset-4 py-1"
                >
                  Snap all stars into place
                </button>
              </div>
            </div>
          )}

          {/* PHASE 2: Merging Letters Cinematic */}
          {phase === 'merging' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center justify-center space-y-6"
            >
              <div className="flex gap-2 justify-center">
                {['M', 'A', 'N', 'A', 'S'].map((letter, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.5, y: 20 }}
                    animate={{ scale: [1, 1.2, 1], y: 0 }}
                    transition={{ delay: idx * 0.15, duration: 0.5 }}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-300 text-amber-200 font-display font-extrabold text-2xl md:text-3xl flex items-center justify-center gold-box-glow"
                  >
                    {letter}
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="text-amber-200 font-mono text-sm tracking-widest uppercase"
              >
                Harmonic Resonance Achieved
              </motion.div>
            </motion.div>
          )}

          {/* PHASE 3: The Sincere Appreciative Glass Card */}
          {phase === 'message' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="py-4 space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-200 text-xs font-semibold tracking-wider">
                <Trophy className="w-4 h-4 text-amber-300" />
                The Final Secret Unlocked
              </div>

              {/* Exact user-requested 3 short lines */}
              <div className="glass-panel p-6 md:p-8 rounded-2xl border border-amber-300/40 text-center space-y-4 shadow-2xl">
                <p className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug gold-glow">
                  Brilliant mind. Loyal heart. Calm strength.
                </p>
                <p className="text-lg md:text-xl font-medium text-amber-200 leading-snug">
                  May every goal you chase come true.
                </p>
                <p className="text-sm md:text-base font-normal text-slate-200 leading-relaxed max-w-md mx-auto">
                  Thank you for being the kind of person people are lucky to know.
                </p>
              </div>

              {/* Final Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Visit Worlds Again</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    onResetAll();
                  }}
                  className="py-3.5 px-6 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white font-medium text-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>Play Again</span>
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
