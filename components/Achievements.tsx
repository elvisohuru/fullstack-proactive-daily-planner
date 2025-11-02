import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { achievementsList } from '../utils/achievements';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Achievements: React.FC = () => {
  const unlockedAchievements = useAppStore((state) => state.unlockedAchievements);

  const allAchievements = achievementsList.map(ach => ({
    ...ach,
    unlocked: unlockedAchievements.includes(ach.id),
  }));

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Achievements</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {allAchievements.map((ach, index) => (
          <motion.div
            key={ach.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-lg flex flex-col items-center text-center transition-all duration-300 ${
              ach.unlocked
                ? 'bg-calm-green-50 dark:bg-calm-green-900/50 border border-calm-green-500'
                : 'bg-slate-100 dark:bg-slate-700/50'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors ${
              ach.unlocked ? 'bg-calm-green-100 dark:bg-calm-green-800' : 'bg-slate-200 dark:bg-slate-600'
            }`}>
              {ach.unlocked ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                >
                  {ach.icon}
                </motion.div>
              ) : <Lock size={24} className="text-slate-400" />}
            </div>
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{ach.name}</p>
            <p className={`text-xs text-slate-500 dark:text-slate-400 mt-1 ${!ach.unlocked && 'opacity-70'}`}>
              {ach.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;