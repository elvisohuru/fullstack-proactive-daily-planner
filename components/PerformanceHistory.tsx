import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { LineChart } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

const PerformanceHistory: React.FC = () => {
  const history = useAppStore((state) => state.performanceHistory);

  // Generate data for the last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  }).reverse();

  const chartData = last7Days.map(dateString => {
    const record = history.find(h => h.date === dateString);
    return {
      date: dateString,
      dayLabel: format(parseISO(dateString), 'E'),
      score: record ? record.score : 0,
    };
  });

  const hasData = history.length > 0;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
        <LineChart size={20} /> Weekly Performance
      </h2>
      <div className="flex justify-between items-end h-32 gap-2 pt-6">
        {chartData.map((day, index) => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="relative w-full h-full flex items-end justify-center">
              <motion.div
                className="w-3/4 bg-calm-blue-300 dark:bg-calm-blue-700 rounded-t-md"
                initial={{ height: '0%' }}
                animate={{ height: `${day.score}%` }}
                transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
                title={`${day.date}: ${day.score}%`}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold bg-slate-900 dark:bg-slate-700 text-white px-2 py-1 rounded-md pointer-events-none">
                  {day.score}%
                </span>
              </motion.div>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{day.dayLabel}</span>
          </div>
        ))}
      </div>
      {!hasData && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-[-6rem] pb-24">
          Complete a day's plan to see your history here.
        </p>
      )}
    </div>
  );
};

export default PerformanceHistory;
