import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Achievement, ALL_ACHIEVEMENTS } from '../utils/storage';
import { Trophy } from 'lucide-react';

interface AchievementsToastProps {
  currentAchievementId: string | null;
  onDismiss: () => void;
}

export default function AchievementsToast({
  currentAchievementId,
  onDismiss,
}: AchievementsToastProps) {
  const [activeItem, setActiveItem] = useState<Achievement | null>(null);

  useEffect(() => {
    if (currentAchievementId && ALL_ACHIEVEMENTS[currentAchievementId]) {
      setActiveItem(ALL_ACHIEVEMENTS[currentAchievementId]);
      const timer = setTimeout(() => {
        setActiveItem(null);
        onDismiss();
      }, 4200);
      return () => clearTimeout(timer);
    }
  }, [currentAchievementId, onDismiss]);

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-sm px-4">
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ y: -40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="glass-panel-gold rounded-2xl p-4 border border-amber-400/50 shadow-2xl flex items-center gap-3.5 pointer-events-auto"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-300 flex items-center justify-center text-xl shrink-0">
              {activeItem.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5" />
                Achievement Unlocked
              </div>
              <h4 className="text-sm font-bold text-white truncate">
                {activeItem.title}
              </h4>
              <p className="text-xs text-amber-100/80 truncate">
                {activeItem.desc}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
