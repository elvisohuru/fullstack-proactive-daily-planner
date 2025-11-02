
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, BookOpen, BarChart3, Upload, FileJson, FileText, MoreVertical, FileSpreadsheet } from 'lucide-react';
import Achievements from './Achievements';
import PastReflections from './PastReflections';
import AdvancedAnalytics from './AdvancedAnalytics';
import { useAppStore } from '../store/useAppStore';

type Tab = 'achievements' | 'reflections' | 'analytics';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'achievements', label: 'Achievements', icon: <Award size={18} /> },
  { id: 'reflections', label: 'Reflections', icon: <BookOpen size={18} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
];

const DataAndInsights: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('achievements');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { exportDataAsJson, exportDataAsMarkdown, importData, exportDataAsCsv } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
    setIsMenuOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          if (window.confirm('Are you sure you want to import this data? This will overwrite your current planner.')) {
            importData(text);
          }
        }
      };
      reader.readAsText(file);
      // Reset file input value to allow importing the same file again
      event.target.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-calm-blue-600 dark:text-calm-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-calm-blue-500"
                />
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <MoreVertical size={18} />
          </button>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 p-1"
              >
                <button onClick={handleImportClick} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md">
                  <Upload size={16} /> Import from JSON...
                </button>
                <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
                <div className="px-3 py-1 text-xs text-slate-400">Export as...</div>
                <button onClick={()=>{exportDataAsJson(); setIsMenuOpen(false);}} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md">
                  <FileJson size={16} /> JSON Backup
                </button>
                <button onClick={()=>{exportDataAsMarkdown(); setIsMenuOpen(false);}} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md">
                  <FileText size={16} /> Markdown Summary
                </button>
                <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
                 <button onClick={()=>{exportDataAsCsv('tasks'); setIsMenuOpen(false);}} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md">
                  <FileSpreadsheet size={16} /> Tasks (CSV)
                </button>
                 <button onClick={()=>{exportDataAsCsv('goals'); setIsMenuOpen(false);}} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md">
                  <FileSpreadsheet size={16} /> Goals (CSV)
                </button>
                 <button onClick={()=>{exportDataAsCsv('routine'); setIsMenuOpen(false);}} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md">
                  <FileSpreadsheet size={16} /> Routine (CSV)
                </button>
                 <button onClick={()=>{exportDataAsCsv('logs'); setIsMenuOpen(false);}} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md">
                  <FileSpreadsheet size={16} /> Time Logs (CSV)
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleFileChange}
          />
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DataAndInsights;
