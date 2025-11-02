import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import Header from './components/Header';
import ProductivityScore from './components/ProductivityScore';
import TodaysPlan from './components/TodaysPlan';
import TaskTimer from './components/TaskTimer';
import TimeLog from './components/TimeLog';
import MyGoals from './components/MyGoals';
import DailyRoutine from './components/DailyRoutine';
import ReflectionTrigger from './components/ReflectionTrigger';
import PerformanceHistory from './components/PerformanceHistory';
import UnplannedTasks from './components/UnplannedTasks';
import DataAndInsights from './components/DataAndInsights';
import ProductivityStreak from './components/ProductivityStreak';
import CommandPalette from './components/CommandPalette';
import ShutdownRoutine from './components/ShutdownRoutine';

function App() {
  const { theme, initialize, setCommandPaletteOpen } = useAppStore();

  useEffect(() => {
    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setCommandPaletteOpen]);


  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      <Header />
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProductivityScore />
              <ProductivityStreak />
            </div>
            <DailyRoutine />
            <TodaysPlan />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <MyGoals />
            <UnplannedTasks />
            <ReflectionTrigger />
            <DataAndInsights />
            <TimeLog />
            <PerformanceHistory />
          </div>
        </div>
      </main>
      <TaskTimer />
      <ShutdownRoutine />
      <CommandPalette />
    </div>
  );
}

export default App;