import React from 'react';
import Header from './Header';
import ProductivityScore from './ProductivityScore';
import TodaysPlan from './TodaysPlan';
import TimeLog from './TimeLog';
import MyGoals from './MyGoals';
import DailyRoutine from './DailyRoutine';
import ReflectionTrigger from './ReflectionTrigger';
import PerformanceHistory from './PerformanceHistory';
import UnplannedTasks from './UnplannedTasks';
import DataAndInsights from './DataAndInsights';
import ProductivityStreak from './ProductivityStreak';

const Planner: React.FC = () => {
  return (
    <>
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
    </>
  );
};

export default Planner;
