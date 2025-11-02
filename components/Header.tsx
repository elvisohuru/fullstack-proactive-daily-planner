
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const Header: React.FC = () => {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  const greeting = "Today's Plan";

  return (
    <header className="flex items-center justify-between p-4 md:p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
      <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
        {greeting}
      </h1>
      <button
        onClick={toggleTheme}
        className="relative w-10 h-10 flex items-center justify-center rounded-full text-slate-600 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        aria-label="Toggle theme"
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={theme}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {theme === 'light' ? <Moon size={22} /> : <Sun size={24} />}
          </motion.div>
        </AnimatePresence>
      </button>
    </header>
  );
};

export default Header;
