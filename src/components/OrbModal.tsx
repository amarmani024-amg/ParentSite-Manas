import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OrbData } from '../utils/storage';
import { sound, triggerHaptic } from '../utils/audio';
import { cosmicFX } from './CosmicStarfield';
import { ExternalLink, KeyRound, CheckCircle2, AlertCircle, X, HelpCircle } from 'lucide-react';

interface OrbModalProps {
  orb: OrbData | null;
  isUnlocked: boolean;
  onClose: () => void;
  onUnlockSuccess: (orbId: string) => void;
}

export default function OrbModal({ orb, isUnlocked, onClose, onUnlockSuccess }: OrbModalProps) {
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  if (!orb) return null;

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isUnlocked) return;

    sound.playClick();
    const cleanInput = code.trim().replace(/\s+/g, '').toUpperCase();
    const cleanExpected = orb.correctCode.trim().replace(/\s+/g, '').toUpperCase();

    if (cleanInput === cleanExpected) {
      // SUCCESS!
      sound.playUnlock();
      triggerHaptic('celebrate');
      cosmicFX.confetti(90);
      onUnlockSuccess(orb.id);
    } else {
      // WRONG CODE
      sound.playError();
      triggerHaptic('medium');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      const nextFails = failedAttempts + 1;
      setFailedAttempts(nextFails);
      setErrorMsg('Not quite, check the end of that world.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: isShaking ? [0, -10, 10, -8, 8, 0] : 0,
          }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25 }}
          className={`w-full max-w-lg rounded-3xl p-6 md:p-8 relative ${
            isUnlocked ? 'glass-panel-gold' : 'glass-panel'
          }`}
        >
          {/* Close button */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header with Orb Icon */}
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-2xl border ${
                isUnlocked
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 gold-box-glow'
                  : 'bg-cyan-500/20 border-cyan-400 text-cyan-300 cyan-box-glow'
              }`}
            >
              {orb.letter}
            </div>
            <div>
              <div className="text-xs font-mono tracking-widest text-cyan-300/80 uppercase">
                Door {orb.letter} · {orb.subtitle}
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {orb.title}
              </h2>
            </div>
          </div>

          {/* One-line Teaser */}
          <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-6 font-light">
            {orb.teaser}
          </p>

          {/* Big Action: Enter This World */}
          <div className="mb-6">
            <a
              href={orb.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-base shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 min-h-[52px]"
            >
              <span>Enter This World</span>
              <ExternalLink className="w-5 h-5" />
            </a>
            <p className="text-xs text-center text-slate-400 mt-2">
              Opens in a new tab. Explore at your own pace!
            </p>
          </div>

          {/* Unlocked State vs Code Input Form */}
          {isUnlocked ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-amber-300 font-semibold text-lg">
                <CheckCircle2 className="w-6 h-6" />
                <span>Unlocked & Verified</span>
              </div>
              <p className="text-xs text-amber-200/90 font-mono tracking-wider">
                CIPHER: {orb.correctCode}
              </p>
            </div>
          ) : (
            <div className="space-y-4 pt-2 border-t border-slate-700/60">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Secret Code
                </label>
                <p className="text-xs text-slate-400">
                  Finish the world, find its Secret Code, bring it back here.
                </p>
              </div>

              <form onSubmit={handleUnlock} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Enter cipher..."
                    className="w-full h-12 px-4 rounded-xl bg-slate-900/80 border border-cyan-500/40 text-white placeholder-slate-500 text-sm font-mono tracking-wider focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/20"
                  />
                  <KeyRound className="w-4 h-4 absolute right-3 top-4 text-cyan-400/60 pointer-events-none" />
                </div>

                <button
                  type="submit"
                  className="h-12 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide active:scale-95 transition-all shadow-md shadow-amber-500/20 min-w-[100px] cursor-pointer"
                >
                  Unlock
                </button>
              </form>

              {/* Error Message */}
              {errorMsg && (
                <div className="flex items-center gap-2 text-rose-300 text-xs bg-rose-950/40 border border-rose-800/50 p-2.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Hint button after 2 wrong attempts */}
              {failedAttempts >= 2 && (
                <div className="pt-1">
                  {!showHint ? (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setShowHint(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 underline underline-offset-4"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Show me a hint
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
                      💡 Hint: Look for the gold box displayed at the end of that world.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
