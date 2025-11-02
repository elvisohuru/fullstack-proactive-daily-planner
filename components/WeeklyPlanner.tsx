import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { format, startOfWeek, endOfWeek, addDays, subDays, eachDayOfInterval, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const WeeklyPlanner: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { weeklyPlans, fetchWeeklyPlan } = useAppStore();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weekKey = format(weekStart, 'yyyy-MM-dd');

  const planForWeek = weeklyPlans[weekKey];

  useEffect(() => {
    // Fetch data for the current week if it's not already loaded
    if (!planForWeek) {
      fetchWeeklyPlan(weekKey);
    }
  }, [weekKey, planForWeek, fetchWeeklyPlan]);

  const goToPreviousWeek = () => {
    setCurrentDate(subDays(currentDate, 7));
  };

  const goToNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Weekly Plan
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={goToPreviousWeek} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300 w-32 text-center">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </span>
          <button onClick={goToNextWeek} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => (
          <div key={day.toString()} className={`p-2 rounded-lg ${isToday(day) ? 'bg-calm-blue-50 dark:bg-calm-blue-900/50' : ''}`}>
            <div className="text-center mb-2">
              <p className={`text-xs font-semibold ${isToday(day) ? 'text-calm-blue-600 dark:text-calm-blue-300' : 'text-slate-500'}`}>
                {format(day, 'E')}
              </p>
              <p className={`text-lg font-bold ${isToday(day) ? 'text-calm-blue-700 dark:text-calm-blue-200' : 'text-slate-700 dark:text-slate-300'}`}>
                {format(day, 'd')}
              </p>
            </div>
            <div className="space-y-1.5">
                {!planForWeek && (
                    <div className="h-12 flex items-center justify-center">
                       <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                    </div>
                )}
                {planForWeek && (planForWeek[format(day, 'yyyy-MM-dd')] || []).map(task => (
                    <motion.div 
                        key={task.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-1.5 text-xs p-1.5 rounded bg-slate-100 dark:bg-slate-700/70"
                    >
                        <div className={`w-3 h-3 mt-0.5 rounded-sm flex items-center justify-center flex-shrink-0 ${task.completed ? 'bg-calm-green-500' : 'border border-slate-400'}`}>
                            {task.completed && <Check size={10} className="text-white"/>}
                        </div>
                        <p className={`flex-grow ${task.completed ? 'line-through text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                            {task.text}
                        </p>
                    </motion.div>
                ))}
                 {planForWeek && (planForWeek[format(day, 'yyyy-MM-dd')] || []).length === 0 && (
                    <div className="h-6"></div>
                 )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyPlanner;
