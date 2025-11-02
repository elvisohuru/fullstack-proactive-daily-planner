import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Moon, Sun, Download, Target, Repeat, BookOpen, BarChart3, TrendingUp, X } from 'lucide-react';

type Command = {
  id: string;
  name: string;
  action: () => void;
  icon: React.ReactNode;
  category: string;
};

const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, toggleTheme, requestExport, setFocusOnElement, theme } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    requestExport('json');
    // We could add a toast notification here to inform the user
  };

  const commands: Command[] = useMemo(() => [
    { id: 'add_task', name: 'Add new task', action: () => setFocusOnElement('new-task-input'), icon: <Plus size={18} />, category: 'Actions' },
    { id: 'add_goal', name: 'Add new goal', action: () => setFocusOnElement('new-goal-input'), icon: <Target size={18} />, category: 'Actions' },
    { id: 'add_routine', name: 'Add new routine', action: () => setFocusOnElement('new-routine-input'), icon: <Repeat size={18} />, category: 'Actions' },
    { id: 'toggle_theme', name: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, action: toggleTheme, icon: theme === 'light' ? <Moon size={18} /> : <Sun size={18} />, category: 'Actions' },
    { id: 'export_data', name: 'Request Data Export (JSON)', action: handleExport, icon: <Download size={18} />, category: 'Actions' },
  ], [setFocusOnElement, toggleTheme, requestExport, theme]);
  
  const filteredCommands = useMemo(() => {
    if (!searchTerm) return commands;
    return commands.filter(cmd => cmd.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, commands]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      inputRef.current?.focus();
    } else {
      setSearchTerm('');
      setActiveIndex(0);
    }
  }, [isCommandPaletteOpen]);
  
  useEffect(() => {
    setActiveIndex(0);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[activeIndex]) {
        filteredCommands[activeIndex].action();
        setCommandPaletteOpen(false);
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-24"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
            transition={{ ease: 'easeOut', duration: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center gap-4 p-4 border-b border-slate-200 dark:border-slate-700">
              <Search size={20} className="text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type a command or search..."
                className="w-full bg-transparent focus:outline-none text-slate-800 dark:text-slate-200"
              />
               <button onClick={() => setCommandPaletteOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                 <X size={20}/>
               </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredCommands.length > 0 ? (
                <ul>
                  {filteredCommands.map((cmd, index) => (
                    <li
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        setCommandPaletteOpen(false);
                      }}
                      className={`flex items-center gap-4 p-3 rounded-md cursor-pointer ${
                        activeIndex === index ? 'bg-calm-blue-100 dark:bg-calm-blue-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="text-slate-500 dark:text-slate-400">{cmd.icon}</div>
                      <span className="text-slate-700 dark:text-slate-300">{cmd.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center p-8 text-slate-500">No results found.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
