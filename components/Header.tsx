import React from 'react';
import { Sun, Moon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const Header: React.FC = () => {
  const { theme, toggleTheme, user, logout } = useAppStore();

  return (
    <header className="flex items-center justify-between p-4 md:p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
      <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
        Proactive Planner
      </h1>
      <div className="flex items-center gap-2">
        {user && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-slate-600 dark:text-slate-400">{user.email}</span>
            <button
              onClick={logout}
              className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
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
      </div>
    </header>
  );
};

export default Header;
