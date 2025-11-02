import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, BookOpen, BarChart3, Clock, Download, Settings as SettingsIcon } from 'lucide-react';
import Achievements from './Achievements';
import PastReflections from './PastReflections';
import AdvancedAnalytics from './AdvancedAnalytics';
import TimeAnalytics from './TimeAnalytics';
import Exports from './Exports';
import Settings from './Settings';


type Tab = 'achievements' | 'reflections' | 'analytics' | 'time' | 'exports' | 'settings';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'achievements', label: 'Achievements', icon: <Award size={18} /> },
  { id: 'reflections', label: 'Reflections', icon: <BookOpen size={18} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  { id: 'time', label: 'Time', icon: <Clock size={18} /> },
  { id: 'exports', label: 'Exports', icon: <Download size={18} /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
];

const DataAndInsights: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('achievements');

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <div className="mb-4 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors flex-shrink-0 ${
                activeTab === tab.id
                  ? 'text-calm-blue-600 dark:text-calm-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-calm-blue-500"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'achievements' && <Achievements />}
            {activeTab === 'reflections' && <PastReflections />}
            {activeTab === 'analytics' && <AdvancedAnalytics />}
            {activeTab === 'time' && <TimeAnalytics />}
            {activeTab === 'exports' && <Exports />}
            {activeTab === 'settings' && <Settings />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DataAndInsights;