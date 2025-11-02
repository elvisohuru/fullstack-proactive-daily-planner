import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { playCompletionSound } from '../utils/sound';

const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const ConfettiPiece: React.FC<{ delay: number, isBurst: boolean }> = ({ delay, isBurst }) => {
  const colors = ['#38bdf8', '#22c55e', '#eab308', '#f472b6', '#a855f7'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  const angle = Math.random() * 2 * Math.PI;
  const radius = isBurst ? 100 + Math.random() * 200 : 50 + Math.random() * 150;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  const rotation = Math.random() * 360;
  const scale = isBurst ? 1.2 : 1;

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 10,
        height: 10,
        backgroundColor: color,
        x: '-50%',
        y: '-50%',
      }}
      initial={{ scale: 0, opacity: 0, rotate: 0 }}
      animate={{
        x: [0, x],
        y: [0, y],
        scale: [0, scale, 0],
        opacity: [0, 1, 1, 0],
        rotate: [0, rotation],
      }}
      transition={{
        duration: isBurst ? 1.5 + Math.random() : 2.5 + Math.random() * 2,
        ease: 'circOut',
        repeat: isBurst ? 0 : Infinity,
        repeatType: 'loop',
        delay,
      }}
    />
  );
};

const ProductivityScore: React.FC = () => {
  const { plan, routine } = useAppStore();

  const todayIndex = new Date().getDay();
  const todaysScheduledRoutine = routine.filter(r => r.recurringDays.length === 0 || r.recurringDays.includes(todayIndex));

  const totalPlanned = plan.tasks.length;
  const completedPlanned = plan.tasks.filter((task) => task.completed).length;

  const totalRoutine = todaysScheduledRoutine.length;
  const completedRoutine = todaysScheduledRoutine.filter((task) => task.completed).length;

  const totalTasks = totalPlanned + totalRoutine;
  const completedTasks = completedPlanned + completedRoutine;

  const score = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const isComplete = score === 100 && totalTasks > 0;
  const prevIsComplete = usePrevious(isComplete);

  useEffect(() => {
    if (isComplete && !prevIsComplete) {
      playCompletionSound();
    }
  }, [isComplete, prevIsComplete]);

  const initialBurstPieces = Array.from({ length: 70 }).map((_, i) => ({ id: i, delay: Math.random() * 0.5 }));
  const continuousPieces = Array.from({ length: 80 }).map((_, i) => ({ id: i, delay: i * 0.1 }));
  
  const circumference = 2 * Math.PI * 54; // 2 * pi * radius
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getMotivationalMessage = () => {
    if (totalTasks === 0) return "Let's plan the day!";
    if (isComplete) return `Amazing! You crushed all ${totalTasks} tasks today!`;
    if (score >= 80) return "Incredible focus, almost there!";
    if (score >= 50) return "You're making great progress!";
    if (score > 0) return "Keep up the momentum!";
    return "Ready to start your day?";
  }

  return (
    <motion.div
      className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg flex flex-col items-center gap-4 relative overflow-hidden"
      animate={{
        boxShadow: isComplete ? '0 0 30px 8px rgba(34, 197, 94, 0.4)' : '0 0 0px 0px rgba(34, 197, 94, 0)',
      }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
    >
      <div className="relative w-40 h-40 flex-shrink-0">
        <AnimatePresence>
          {isComplete && (
            <>
              {initialBurstPieces.map(p => <ConfettiPiece key={`burst-${p.id}`} delay={p.delay} isBurst={true} />)}
              {continuousPieces.map(p => <ConfettiPiece key={`rain-${p.id}`} delay={p.delay} isBurst={false} />)}
            </>
          )}
        </AnimatePresence>
        <svg className="w-full h-full relative z-10" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" strokeWidth="12" className="text-slate-200 dark:text-slate-700" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none" strokeWidth="12"
            className={`stroke-current ${isComplete ? 'text-calm-green-500' : 'text-calm-blue-500'}`}
            strokeLinecap="round" transform="rotate(-90 60 60)"
            style={{ strokeDasharray: circumference }}
            animate={{ strokeDashoffset, filter: isComplete ? ['drop-shadow(0 0 0px #22c55e)', 'drop-shadow(0 0 10px #22c55e)', 'drop-shadow(0 0 0px #22c55e)'] : 'none' }}
            transition={{ strokeDashoffset: { duration: 0.8, ease: 'easeInOut' }, filter: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">{score}<span className="text-2xl text-slate-500">%</span></span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          {getMotivationalMessage()}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {completedTasks} of {totalTasks} tasks completed
        </p>
      </div>
    </motion.div>
  );
};

export default ProductivityScore;