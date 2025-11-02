import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Trash2, ArrowUpCircle, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UnplannedTasks: React.FC = () => {
  const [newText, setNewText] = useState('');
  const { unplannedTasks, addUnplannedTask, deleteUnplannedTask, planUnplannedTask } = useAppStore();

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newText.trim()) {
      addUnplannedTask(newText.trim());
      setNewText('');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
        <Inbox size={20} /> Unplanned Tasks
      </h2>
      <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Capture a thought..."
          className="flex-grow bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-2"
        />
        <button
          type="submit"
          className="bg-calm-blue-500 hover:bg-calm-blue-600 text-white font-semibold p-2 rounded-lg flex items-center justify-center aspect-square transition"
          aria-label="Add Unplanned Task"
        >
          <Plus size={20} />
        </button>
      </form>
      <ul className="space-y-2">
        <AnimatePresence>
          {unplannedTasks.map((task) => (
            <motion.li
              key={task.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
            >
              <span className="flex-grow text-sm text-slate-700 dark:text-slate-300">{task.text}</span>
              <button
                onClick={() => planUnplannedTask(task.id)}
                className="text-slate-400 hover:text-calm-green-500 p-1"
                aria-label="Plan for today"
              >
                <ArrowUpCircle size={18} />
              </button>
              <button
                onClick={() => deleteUnplannedTask(task.id)}
                className="text-slate-400 hover:text-red-500 p-1"
                aria-label="Delete task"
              >
                <Trash2 size={18} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {unplannedTasks.length === 0 && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-2">A place to quickly jot down tasks for later.</p>
      )}
    </div>
  );
};

export default UnplannedTasks;
