import React, { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';
import { formatTime } from '../utils/dateUtils';
import { Tag, Target } from 'lucide-react';

const AnalyticsBar: React.FC<{ label: string; duration: number; maxDuration: number; colorClass: string }> = ({ label, duration, maxDuration, colorClass }) => {
  const percentage = maxDuration > 0 ? (duration / maxDuration) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="font-medium text-slate-600 dark:text-slate-300 truncate pr-2">{label}</span>
        <span className="font-mono text-slate-500 dark:text-slate-400">{formatTime(duration)}</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
        <motion.div
          className={`h-2.5 rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

const TimeAnalytics: React.FC = () => {
  const { timeAnalytics, fetchTimeAnalytics } = useAppStore();

  useEffect(() => {
    if (!timeAnalytics) {
      fetchTimeAnalytics();
    }
  }, [timeAnalytics, fetchTimeAnalytics]);

  if (!timeAnalytics) {
    return <div className="text-center text-sm text-slate-500 py-8">Loading analytics...</div>;
  }

  const maxGoalDuration = Math.max(...timeAnalytics.byGoal.map(g => g.duration), 0);
  const maxTagDuration = Math.max(...timeAnalytics.byTag.map(t => t.duration), 0);
  const totalDuration = timeAnalytics.byGoal.reduce((sum, g) => sum + g.duration, 0);

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">Time Analytics</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Total time logged: <span className="font-bold">{formatTime(totalDuration)}</span></p>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2"><Target size={16} /> Time per Goal</h4>
          <div className="space-y-3">
            {timeAnalytics.byGoal.length > 0 ? timeAnalytics.byGoal.map(goal => (
              <AnalyticsBar key={goal.goalId} label={goal.goalText} duration={goal.duration} maxDuration={maxGoalDuration} colorClass="bg-calm-blue-500" />
            )) : <p className="text-xs text-slate-400">No time logged towards specific goals.</p>}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2"><Tag size={16} /> Time per Tag</h4>
          <div className="space-y-3">
            {timeAnalytics.byTag.length > 0 ? timeAnalytics.byTag.map(tag => (
              <AnalyticsBar key={tag.tag} label={`#${tag.tag}`} duration={tag.duration} maxDuration={maxTagDuration} colorClass="bg-calm-green-500" />
            )) : <p className="text-xs text-slate-400">No time logged with specific tags.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeAnalytics;
