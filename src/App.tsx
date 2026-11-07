/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CosmicStarfield, { cosmicFX } from './components/CosmicStarfield';
import CustomCursor from './components/CustomCursor';
import IntroMiniGame from './components/IntroMiniGame';
import OrbModal from './components/OrbModal';
import ArcadeModal from './components/ArcadeModal';
import FinalSecretModal from './components/FinalSecretModal';
import EasterEggs from './components/EasterEggs';
import AchievementsToast from './components/AchievementsToast';

import {
  ORBS_CONFIG,
  OrbData,
  loadGatewayState,
  saveGatewayState,
  resetGatewayState,
  GatewayState,
} from './utils/storage';
import { sound, triggerHaptic } from './utils/audio';

import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Gamepad2,
  CheckCircle2,
  Lock,
  Compass,
  KeyRound,
} from 'lucide-react';

export default function App() {
  const [state, setState] = useState<GatewayState>(() => loadGatewayState());
  const [activeOrb, setActiveOrb] = useState<OrbData | null>(null);
  const [arcadeOpen, setArcadeOpen] = useState(false);
  const [finalModalOpen, setFinalModalOpen] = useState(false);
  const [muted, setMuted] = useState(() => sound.isMuted());
  const [bgTapCount, setBgTapCount] = useState(0);
  const [currentToastAchievement, setCurrentToastAchievement] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Long press detection on the title "The Gateway" (Easter Egg #4)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPressingTitle, setIsPressingTitle] = useState(false);

  // Sync state to storage
  useEffect(() => {
    saveGatewayState(state);
  }, [state]);

  const unlockAchievement = (id: string) => {
    if (!state.achievements.includes(id)) {
      setState((prev) => ({
        ...prev,
        achievements: [...prev.achievements, id],
      }));
      setCurrentToastAchievement(id);
    }
  };

  const handleOrbUnlockSuccess = (orbId: string) => {
    const updatedUnlocked = Array.from(new Set([...state.unlockedOrbs, orbId]));
    const nextState = {
      ...state,
      unlockedOrbs: updatedUnlocked,
    };

    // Check milestones
    if (updatedUnlocked.length === 1) {
      unlockAchievement('gate_opener');
    }
    if (updatedUnlocked.length === 3) {
      unlockAchievement('code_breaker');
    }
    if (updatedUnlocked.length === 5) {
      unlockAchievement('master_key');
      sound.playFanfare();
      cosmicFX.fireworks(5);
    }

    setState(nextState);
  };

  const handleSecretFound = (secretId: string) => {
    if (!state.secretsFound.includes(secretId)) {
      const updatedSecrets = [...state.secretsFound, secretId];
      setState((prev) => ({
        ...prev,
        secretsFound: updatedSecrets,
      }));
      unlockAchievement('secret_seeker');

      if (updatedSecrets.length >= 5) {
        unlockAchievement('easter_master');
      }
    }
  };

  // Title long-press handlers (1.5 seconds)
  const handleTitleTouchStart = () => {
    setIsPressingTitle(true);
    longPressTimerRef.current = setTimeout(() => {
      sound.playUnlock();
      triggerHaptic('celebrate');
      cosmicFX.confetti(60);
      handleSecretFound('title_longpress');
      setIsPressingTitle(false);
    }, 1500);
  };

  const handleTitleTouchEnd = () => {
    setIsPressingTitle(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleResetProgress = () => {
    sound.playClick();
    const fresh = resetGatewayState();
    setState(fresh);
    setConfirmResetOpen(false);
    setActiveOrb(null);
    setFinalModalOpen(false);
    setArcadeOpen(false);
  };

  const isAllUnlocked = state.unlockedOrbs.length === ORBS_CONFIG.length;
  const progressRatio = state.unlockedOrbs.length / ORBS_CONFIG.length;

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Starfield Canvas with interactive tap handler */}
      <CosmicStarfield
        onBackgroundTapped={() => {
          setBgTapCount((prev) => prev + 1);
        }}
      />

      {/* Custom Glowing Cursor for Desktop Hover */}
      <CustomCursor />

      {/* Floating Toast for Achievements */}
      <AchievementsToast
        currentAchievementId={currentToastAchievement}
        onDismiss={() => setCurrentToastAchievement(null)}
      />

      {/* INTRO MINI GAME: Wake the Gate (if not yet completed) */}
      {!state.introCompleted ? (
        <IntroMiniGame
          onComplete={() => {
            setState((prev) => ({ ...prev, introCompleted: true }));
            unlockAchievement('first_step');
          }}
          onStarTapFirstTime={() => {
            unlockAchievement('first_step');
          }}
        />
      ) : (
        <>
          {/* TOP APP HEADER */}
          <header className="relative z-30 w-full px-4 md:px-8 py-4 flex items-center justify-between border-b border-cyan-500/15 backdrop-blur-md bg-slate-950/40">
            {/* Wordmark with hidden Easter Egg Long Press */}
            <div className="flex items-center gap-3">
              <button
                onMouseDown={handleTitleTouchStart}
                onMouseUp={handleTitleTouchEnd}
                onMouseLeave={handleTitleTouchEnd}
                onTouchStart={handleTitleTouchStart}
                onTouchEnd={handleTitleTouchEnd}
                className={`text-lg md:text-xl font-extrabold tracking-tight text-white transition-all text-left flex items-center gap-2 cursor-pointer select-none ${
                  isPressingTitle ? 'scale-105 cyan-glow text-cyan-300' : 'hover:text-cyan-200'
                }`}
                title="Hold for a moment..."
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-display">The Gateway</span>
              </button>

              <span className="hidden sm:inline-block text-xs font-mono text-cyan-400/60 pl-2 border-l border-slate-700">
                Five doors · One secret
              </span>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Sound Toggle */}
              <button
                onClick={() => {
                  const nowMuted = sound.toggleMute();
                  setMuted(nowMuted);
                  if (!nowMuted) sound.playClick();
                }}
                className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-slate-300 hover:text-cyan-300 transition-colors border border-cyan-500/20 cursor-pointer"
                aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
              >
                {muted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
              </button>

              {/* Reset Button */}
              <button
                onClick={() => {
                  sound.playClick();
                  setConfirmResetOpen(true);
                }}
                className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors border border-slate-700/60 cursor-pointer"
                aria-label="Reset progress"
                title="Reset progress"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* MAIN GATEWAY HUB */}
          <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-5xl mx-auto w-full text-center">
            {/* Title & Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 md:mb-12"
            >
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight cyan-glow mb-3 font-display">
                The Gateway
              </h1>
              <p className="text-base md:text-xl text-cyan-100/90 font-light max-w-md mx-auto leading-relaxed">
                Five doors. Five surprises. One final secret.
              </p>
            </motion.div>

            {/* PROGRESS BAR */}
            <div className="w-full max-w-md mx-auto mb-10 px-4">
              <div className="flex justify-between items-center text-xs font-mono text-cyan-300 mb-2">
                <span>PROGRESSION</span>
                <span className="font-bold tracking-wider">
                  {state.unlockedOrbs.length} of {ORBS_CONFIG.length} unlocked
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-900/80 rounded-full overflow-hidden border border-cyan-500/30 p-0.5">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressRatio * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* FIVE GLOWING ORBS: M - A - N - A - S */}
            <div
              className={`flex flex-wrap items-center justify-center gap-4 md:gap-6 w-full transition-all duration-700 ${
                isAllUnlocked ? 'scale-105' : ''
              }`}
            >
              {ORBS_CONFIG.map((orb, index) => {
                const isUnlocked = state.unlockedOrbs.includes(orb.id);

                return (
                  <motion.div
                    key={orb.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="flex flex-col items-center group w-24 sm:w-28 md:w-36"
                  >
                    {/* The Interactive Orb Button */}
                    <button
                      onClick={() => {
                        sound.playClick();
                        triggerHaptic('light');
                        setActiveOrb(orb);
                      }}
                      className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 ${
                        isUnlocked
                          ? 'bg-amber-400/20 border-2 border-amber-300 text-amber-200 gold-box-glow scale-105'
                          : 'glass-panel hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 hover:scale-105'
                      }`}
                      aria-label={`Open Door ${orb.letter}: ${orb.title}`}
                    >
                      {/* Aura pulse when unlocked */}
                      {isUnlocked && (
                        <div className="absolute inset-0 rounded-full bg-amber-400/15 animate-ping pointer-events-none" />
                      )}

                      {/* Letter Glyph */}
                      <span className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                        {orb.letter}
                      </span>

                      {/* Status indicator icon */}
                      <div className="absolute -bottom-2 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider flex items-center gap-1 bg-slate-950 border border-slate-700">
                        {isUnlocked ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5 text-amber-300" />
                            <span className="text-amber-300">OPEN</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-2.5 h-2.5 text-cyan-400" />
                            <span className="text-cyan-400">KEY</span>
                          </>
                        )}
                      </div>
                    </button>

                    {/* Subtitle Under Orb */}
                    <div className="mt-4 text-center">
                      <p className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                        {orb.title}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-mono mt-0.5">
                        {orb.subtitle}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* THE FINAL SECRET DOOR: Emerges when all 5 orbs are unlocked */}
            {isAllUnlocked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="mt-12 w-full max-w-sm mx-auto"
              >
                <div className="p-1 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 shadow-2xl">
                  <button
                    onClick={() => {
                      sound.playUnlock();
                      triggerHaptic('heavy');
                      setFinalModalOpen(true);
                    }}
                    className="w-full py-4 px-6 rounded-[22px] bg-slate-950 text-white flex items-center justify-center gap-3 active:scale-98 transition-transform cursor-pointer gold-box-glow"
                  >
                    <Compass className="w-6 h-6 text-amber-300 animate-spin" style={{ animationDuration: '10s' }} />
                    <div className="text-left">
                      <div className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">
                        Resonance Complete
                      </div>
                      <div className="text-lg font-extrabold text-white tracking-wide font-display">
                        The final door.
                      </div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* BONUS ARCADE BUTTON (Unlocked after >= 1 orb unlocked) */}
            {state.unlockedOrbs.length >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <button
                  onClick={() => {
                    sound.playClick();
                    setArcadeOpen(true);
                  }}
                  className="px-4 py-2 rounded-2xl glass-panel border border-cyan-400/40 hover:border-cyan-400 text-cyan-200 hover:text-white text-xs font-medium flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4 text-cyan-300" />
                  <span>Warm-Up Arcade (Relax & Play)</span>
                </button>
              </motion.div>
            )}
          </main>

          {/* FOOTER */}
          <footer className="relative z-20 w-full px-6 py-4 text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2 max-w-5xl mx-auto">
            <span>The Gateway · Built with precision for you</span>
            <div className="flex items-center gap-4 text-slate-400">
              <button
                onClick={() => {
                  sound.playClick();
                  setConfirmResetOpen(true);
                }}
                className="hover:text-slate-200 underline underline-offset-4"
              >
                Reset Progress
              </button>
            </div>
          </footer>

          {/* ORB MODAL FOR SELECTED DOOR */}
          <OrbModal
            orb={activeOrb}
            isUnlocked={activeOrb ? state.unlockedOrbs.includes(activeOrb.id) : false}
            onClose={() => setActiveOrb(null)}
            onUnlockSuccess={(orbId) => {
              handleOrbUnlockSuccess(orbId);
            }}
          />

          {/* BONUS ARCADE MODAL */}
          <ArcadeModal
            isOpen={arcadeOpen}
            onClose={() => setArcadeOpen(false)}
            onAchievement={(id) => unlockAchievement(id)}
          />

          {/* FINAL SECRET MODAL */}
          <FinalSecretModal
            isOpen={finalModalOpen}
            onClose={() => setFinalModalOpen(false)}
            onResetAll={handleResetProgress}
            onCompleted={() => {
              unlockAchievement('constellation');
              setState((prev) => ({ ...prev, finalSecretSeen: true }));
            }}
          />

          {/* EASTER EGGS / SURPRISES SYSTEM */}
          <EasterEggs
            discoveredSecrets={state.secretsFound}
            onSecretFound={handleSecretFound}
            backgroundTapCount={bgTapCount}
          />

          {/* RESET CONFIRMATION MODAL */}
          <AnimatePresence>
            {confirmResetOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-slate-700 text-center space-y-4"
                >
                  <h3 className="text-lg font-bold text-white">Reset All Progress?</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This will clear your unlocked doors and reset the Gateway. You can always unlock them again!
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setConfirmResetOpen(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResetProgress}
                      className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white"
                    >
                      Reset Now
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
