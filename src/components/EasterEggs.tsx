import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound, triggerHaptic } from '../utils/audio';
import { cosmicFX } from './CosmicStarfield';
import { Sparkles, Terminal, X, Check, Lock, Smartphone, ChevronRight } from 'lucide-react';

interface EasterEggsProps {
  discoveredSecrets: string[];
  onSecretFound: (secretId: string) => void;
  backgroundTapCount: number;
}

interface SecretDef {
  id: string;
  title: string;
  hint: string;
  revealText: string;
}

const SECRETS_LIST: SecretDef[] = [
  {
    id: 'starfield_10_taps',
    title: 'Cosmic Observer',
    hint: 'Tap the starfield background 10 times.',
    revealText: 'Protocol 42: You have an engineer’s relentless curiosity. Nothing escapes your careful observation.',
  },
  {
    id: 'hello_terminal',
    title: 'Terminal Handshake',
    hint: 'Type "hello" anywhere on the keyboard or in the console.',
    revealText: 'System Response: Hello! Status check: 100% disciplined genius detected.',
  },
  {
    id: 'konami_code',
    title: 'Retro Architect',
    hint: 'Execute the legendary Konami sequence (↑ ↑ ↓ ↓ ← → ← → B A).',
    revealText: 'Override Granted: You know the classics. Unleashing cosmic meteor shower!',
  },
  {
    id: 'title_longpress',
    title: 'Quiet Depth',
    hint: 'Hold / long-press the title "The Gateway" for 1.5 seconds.',
    revealText: 'A quiet note: Your dedication, maturity, and calm focus under pressure inspire everyone around you.',
  },
  {
    id: 'device_shake',
    title: 'Kinetic Resonance',
    hint: 'Shake your mobile device (or trigger kinetic shake).',
    revealText: 'Kinetic threshold reached: Energy converted into a pure celebratory confetti storm!',
  },
];

export default function EasterEggs({
  discoveredSecrets,
  onSecretFound,
  backgroundTapCount,
}: EasterEggsProps) {
  const [activeSecretModal, setActiveSecretModal] = useState<SecretDef | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');

  // 1. Check background taps
  useEffect(() => {
    if (backgroundTapCount >= 10 && !discoveredSecrets.includes('starfield_10_taps')) {
      triggerSecret('starfield_10_taps');
    }
  }, [backgroundTapCount, discoveredSecrets]);

  // 2. Keyboard listeners: "hello" & Konami code
  useEffect(() => {
    let keyBuffer = '';
    const konamiSequence = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];
    let konamiIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in code input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      const key = e.key.toLowerCase();
      keyBuffer = (keyBuffer + key).slice(-8);

      if (keyBuffer.includes('hello')) {
        keyBuffer = '';
        triggerSecret('hello_terminal');
      }

      // Konami tracking
      if (
        e.key.toLowerCase() === konamiSequence[konamiIndex].toLowerCase() ||
        e.key === konamiSequence[konamiIndex]
      ) {
        konamiIndex++;
        if (konamiIndex === konamiSequence.length) {
          konamiIndex = 0;
          cosmicFX.shootingStarShower();
          triggerSecret('konami_code');
        }
      } else {
        konamiIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [discoveredSecrets]);

  // 3. Mobile Device Shake detection
  useEffect(() => {
    let lastX: number | null = null;
    let lastY: number | null = null;
    let lastZ: number | null = null;
    let lastTime = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      const current = e.accelerationIncludingGravity;
      if (!current || current.x === null || current.y === null || current.z === null) return;

      const curTime = Date.now();
      if (curTime - lastTime > 120) {
        const diffTime = curTime - lastTime;
        lastTime = curTime;

        if (lastX !== null && lastY !== null && lastZ !== null) {
          const speed =
            (Math.abs(current.x + current.y + current.z - lastX - lastY - lastZ) / diffTime) * 10000;
          if (speed > 800) {
            cosmicFX.confetti(100);
            triggerSecret('device_shake');
          }
        }

        lastX = current.x;
        lastY = current.y;
        lastZ = current.z;
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [discoveredSecrets]);

  const triggerSecret = (id: string) => {
    const def = SECRETS_LIST.find((s) => s.id === id);
    if (!def) return;

    sound.playFanfare();
    triggerHaptic('celebrate');
    cosmicFX.confetti(60);

    onSecretFound(id);
    setActiveSecretModal(def);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (terminalInput.trim().toLowerCase() === 'hello') {
      setTerminalOpen(false);
      setTerminalInput('');
      triggerSecret('hello_terminal');
    } else if (terminalInput.trim().toLowerCase() === 'konami') {
      setTerminalOpen(false);
      setTerminalInput('');
      cosmicFX.shootingStarShower();
      triggerSecret('konami_code');
    } else if (terminalInput.trim().toLowerCase() === 'shake') {
      setTerminalOpen(false);
      setTerminalInput('');
      cosmicFX.confetti(100);
      triggerSecret('device_shake');
    } else {
      sound.playError();
      setTerminalInput('');
    }
  };

  const totalSecrets = SECRETS_LIST.length;
  const countFound = discoveredSecrets.length;

  return (
    <>
      {/* Discreet floating Secrets Badge */}
      <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2">
        {/* Terminal quick-access for touch devices */}
        <button
          onClick={() => {
            sound.playClick();
            setTerminalOpen(true);
          }}
          className="w-10 h-10 rounded-full glass-panel border border-cyan-400/30 flex items-center justify-center text-cyan-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Open secret terminal"
        >
          <Terminal className="w-4 h-4" />
        </button>

        {/* Counter Pill */}
        <button
          onClick={() => {
            sound.playClick();
            setDrawerOpen(true);
          }}
          className="px-3 py-2 rounded-full glass-panel border border-cyan-400/30 hover:border-cyan-400/60 text-xs text-cyan-200 flex items-center gap-2 font-mono shadow-lg transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Secrets: {countFound}/{totalSecrets}</span>
        </button>
      </div>

      {/* Secret Discovered Celebration Modal */}
      <AnimatePresence>
        {activeSecretModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md glass-panel-gold rounded-3xl p-6 relative border border-amber-400/40 text-center"
            >
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveSecretModal(null);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 gold-box-glow">
                <Sparkles className="w-6 h-6" />
              </div>

              <div className="text-xs font-mono text-amber-300 uppercase tracking-widest mb-1">
                Anomaly Discovered
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {activeSecretModal.title}
              </h3>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-400/30 text-amber-100 text-sm leading-relaxed mb-4 font-light">
                {activeSecretModal.revealText}
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveSecretModal(null);
                }}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm active:scale-95 transition-all"
              >
                Continue Exploring
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Secrets List & Hints Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-lg glass-panel rounded-t-3xl sm:rounded-3xl p-6 relative border border-cyan-400/30 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <h3 className="text-lg font-bold text-white">
                    Hidden Anomalies ({countFound}/{totalSecrets})
                  </h3>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    setDrawerOpen(false);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                {SECRETS_LIST.map((secret) => {
                  const isFound = discoveredSecrets.includes(secret.id);
                  return (
                    <div
                      key={secret.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isFound
                          ? 'bg-amber-500/10 border-amber-400/40 text-amber-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-white">
                          {secret.title}
                        </span>
                        {isFound ? (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-300 font-mono">
                            <Check className="w-3.5 h-3.5" /> Discovered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-mono">
                            <Lock className="w-3 h-3" /> Undiscovered
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed">
                        {isFound ? secret.revealText : `Hint: ${secret.hint}`}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Mobile trigger options */}
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-cyan-300" />
                  Touch shortcuts:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      cosmicFX.confetti(90);
                      triggerSecret('device_shake');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300"
                  >
                    Simulate Shake
                  </button>
                  <button
                    onClick={() => {
                      cosmicFX.shootingStarShower();
                      triggerSecret('konami_code');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300"
                  >
                    Konami Trigger
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Secret Terminal Prompt */}
      <AnimatePresence>
        {terminalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-950 rounded-2xl border border-cyan-500/40 p-5 font-mono shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-xs text-cyan-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Gateway Shell // Command Prompt
                </span>
                <button
                  onClick={() => setTerminalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-3">
                Enter command code (e.g. &apos;hello&apos;, &apos;konami&apos;, &apos;shake&apos;):
              </p>

              <form onSubmit={handleTerminalSubmit} className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="type command..."
                  className="flex-1 bg-slate-900 border border-cyan-500/30 rounded-lg px-3 py-2 text-xs text-cyan-200 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Run
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
