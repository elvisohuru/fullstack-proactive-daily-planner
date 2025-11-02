
import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { getTodayDateString, formatLogTimestamp, formatTime } from '../utils/dateUtils';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const TimeLog: React.FC = () => {
  const logs = useAppStore((state) => state.logs);
  const today = getTodayDateString();
  const todaysLogs = logs.filter((log) => log.dateString === today);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Today's Time Log</h2>
      {todaysLogs.length > 0 ? (
        <ul className="space-y-3">
          {todaysLogs.map((log, index) => (
            <motion.li
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-calm-blue-500" />
                <span className="text-slate-700 dark:text-slate-300">{log.task}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-600 dark:text-slate-400">{formatTime(log.duration)}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{formatLogTimestamp(log.timestamp)}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-slate-500 dark:text-slate-400 py-4">No time logged today.</p>
      )}
    </div>
  );
};

export default TimeLog;
