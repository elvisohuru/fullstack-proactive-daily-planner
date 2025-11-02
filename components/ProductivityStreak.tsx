import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductivityStreak: React.FC = () => {
  const streak = useAppStore((state) => state.streak);

  const getMotivationalMessage = () => {
    if (streak.current === 0) return "Start a new streak today!";
    if (streak.current <= 3) return "Great start, keep it going!";
    if (streak.current <= 7) return "You're building a solid habit!";
    if (streak.current <= 14) return "Incredible consistency!";
    return "You're on fire!";
  };

  const hasStreak = streak.current > 0;

  return (
    <motion.div
      className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center text-center relative overflow-hidden"
    >
        <div className="flex items-center justify-center gap-4">
            <motion.div
              animate={hasStreak ? {
                scale: [1, 1.1, 1],
                filter: ['drop-shadow(0 0 0px #f97316)', 'drop-shadow(0 0 10px #f97316)', 'drop-shadow(0 0 0px #f97316)'],
              } : {}}
              transition={hasStreak ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
            >
             <Flame size={48} className={`transition-colors duration-500 ${hasStreak ? 'text-orange-500' : 'text-slate-400 dark:text-slate-600'}`} />
            </motion.div>
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={streak.current}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{y: 20, opacity: 0}}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="font-bold text-7xl text-slate-800 dark:text-slate-100"
                >
                    {streak.current}
                </motion.div>
            </AnimatePresence>
        </div>

      <p className="font-semibold text-lg text-slate-700 dark:text-slate-300 mt-2">
        Current Streak
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 h-5 mt-1">
        {getMotivationalMessage()}
      </p>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 w-full flex justify-center items-baseline gap-2">
        <span className="font-semibold text-slate-600 dark:text-slate-400">Longest:</span>
        <span className="font-bold text-xl text-slate-700 dark:text-slate-200">{streak.longest}</span>
        <span className="text-sm text-slate-500 dark:text-slate-400">days</span>
      </div>
    </motion.div>
  );
};

export default ProductivityStreak;