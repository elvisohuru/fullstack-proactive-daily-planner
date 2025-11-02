import React from 'react';
import { Reorder } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import Header from './components/Header';
import ProductivityScore from './components/ProductivityScore';
import TodaysPlan from './components/TodaysPlan';
import TimeLog from './components/TimeLog';
import MyGoals from './components/MyGoals';
import DailyRoutine from './components/DailyRoutine';
import ReflectionTrigger from './components/ReflectionTrigger';
import PerformanceHistory from './components/PerformanceHistory';
import UnplannedTasks from './components/UnplannedTasks';
import DataAndInsights from './components/DataAndInsights';
import ProductivityStreak from './components/ProductivityStreak';
import { DashboardComponentId, DashboardLayout } from './types';

const componentMap: Record<DashboardComponentId, React.ComponentType> = {
  ProductivityScore,
  ProductivityStreak,
  DailyRoutine,
  TodaysPlan,
  MyGoals,
  UnplannedTasks,
  ReflectionTrigger,
  DataAndInsights,
  TimeLog,
  PerformanceHistory,
};

const Planner: React.FC = () => {
  const { dashboardLayout, updateDashboardLayout } = useAppStore();

  const handleReorder = (column: 'left' | 'right') => (newOrder: DashboardComponentId[]) => {
    const newLayout: DashboardLayout = {
      ...dashboardLayout,
      [column]: newOrder,
    };
    updateDashboardLayout(newLayout);
  };
  
  const renderComponent = (id: DashboardComponentId) => {
    const Component = componentMap[id];
    return <Reorder.Item as="div" key={id} value={id}>{Component && <Component />}</Reorder.Item>;
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
             <Reorder.Group as="div" axis="y" values={dashboardLayout.left} onReorder={handleReorder('left')} className="space-y-6">
                {dashboardLayout.left.map(renderComponent)}
             </Reorder.Group>
          </div>
          <div className="lg:col-span-2">
            <Reorder.Group as="div" axis="y" values={dashboardLayout.right} onReorder={handleReorder('right')} className="space-y-6">
                {dashboardLayout.right.map(renderComponent)}
            </Reorder.Group>
          </div>
        </div>
      </main>
    </>
  );
};

export default Planner;