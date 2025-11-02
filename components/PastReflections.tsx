import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

const PastReflections: React.FC = () => {
  const reflections = useAppStore((state) => state.reflections);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReflections = useMemo(() => {
    return reflections
      .filter(r => 
        r.well.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.improve.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [reflections, searchTerm]);

  return (
    <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Reflection History</h3>
      <input
        type="text"
        placeholder="Search reflections..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-2 mb-4 text-sm"
      />
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {filteredReflections.length > 0 ? (
          filteredReflections.map((r, index) => (
            <motion.div 
                key={r.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg"
            >
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-2">
                {format(parseISO(r.date), 'EEEE, MMMM d, yyyy')}
              </p>
              <div>
                <p className="text-xs font-medium text-calm-green-700 dark:text-calm-green-400">What went well:</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{r.well}</p>
              </div>
              <div className="mt-2">
                <p className="text-xs font-medium text-calm-blue-700 dark:text-calm-blue-400">To improve:</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{r.improve}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
            {reflections.length > 0 ? 'No matching reflections found.' : 'No reflections saved yet.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default PastReflections;
