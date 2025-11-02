import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

type AuthMode = 'login' | 'signup';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, signup, error, isLoading } = useAppStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err: any) {
      setLocalError(err.message || 'An error occurred.');
    }
  };

  const currentError = localError || error;

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8"
      >
        <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">
          Proactive Planner
        </h1>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
          {mode === 'login' ? 'Welcome back!' : 'Create your account'}
        </p>

        <div className="flex justify-center mb-6 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
          <button
            onClick={() => { setMode('login'); setLocalError(null); }}
            className={`w-1/2 py-2 rounded-md font-semibold transition-colors ${mode === 'login' ? 'bg-white dark:bg-slate-800 text-calm-blue-600' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode('signup'); setLocalError(null); }}
            className={`w-1/2 py-2 rounded-md font-semibold transition-colors ${mode === 'signup' ? 'bg-white dark:bg-slate-800 text-calm-blue-600' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-calm-blue-500 focus:border-transparent rounded-lg px-4 py-2"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-calm-blue-500 focus:border-transparent rounded-lg px-4 py-2"
              placeholder="••••••••"
            />
          </div>

          <AnimatePresence>
            {currentError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center text-red-500 text-sm"
              >
                {currentError}
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 bg-calm-blue-600 hover:bg-calm-blue-700 text-white font-bold rounded-lg transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                mode === 'login' ? 'Log In' : 'Create Account'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Auth;
