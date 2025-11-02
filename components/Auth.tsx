import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthResponse } from '../types';
import PasswordStrengthMeter from './PasswordStrengthMeter';

type AuthMode = 'login' | 'signup' | 'forgotPassword' | 'resetPassword' | '2fa';

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 12.05c0-.81-.07-1.57-.2-2.3H12v4.35h5.24c-.22 1.41-.89 2.62-1.99 3.4v2.79h3.58c2.09-1.92 3.3-4.73 3.3-7.94Z"/><path fill="currentColor" d="M12 22c3.24 0 5.95-1.08 7.93-2.92l-3.58-2.79c-1.08.73-2.45 1.16-4.35 1.16c-3.35 0-6.19-2.25-7.21-5.29H1.11v2.87A11.97 11.97 0 0 0 12 22Z"/><path fill="currentColor" d="M4.79 14.71a6.93 6.93 0 0 1 0-5.42V6.42H1.11a11.97 11.97 0 0 0 0 11.16Z"/><path fill="currentColor"d="M12 4.5c1.77 0 3.35.61 4.6_l3.15-3.15A11.9 11.9 0 0 0 12 0A11.97 11.97 0 0 0 .07 6.42l3.72 2.86C4.81 6.75 8.65 4.5 12 4.5Z"/></svg>
);
  
const GithubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.5 2.3.93 2.87.71c.09-.55.34-1.04.6-1.28c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/></svg>
);

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const { login, signup, socialLogin, forgotPassword, resetPassword, error, isLoading } = useAppStore();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('resetToken');
    if (token) {
      setResetToken(token);
      setMode('resetPassword');
    }
  }, []);

  const clearState = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setTwoFactorCode('');
    setLocalError(null);
    setMessage(null);
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    clearState();
  };
  
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLocalError(null);
    setMessage(null);
    try {
        await socialLogin(provider);
    } catch (err: any) {
        setLocalError(err.message || 'An error occurred.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setMessage(null);

    try {
      if (mode === 'login') {
        const response = await login(email, password);
        if (response.twoFactorRequired) {
            setMode('2fa');
        }
      } else if (mode === '2fa') {
        await login(email, password, twoFactorCode);
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
            throw new Error("Passwords do not match.");
        }
        await signup(email, password);
      } else if (mode === 'forgotPassword') {
        await forgotPassword(email);
        setMessage("If an account exists for this email, a password reset link has been sent. Check your console for the simulated email.");
      } else if (mode === 'resetPassword' && resetToken) {
        if (password !== confirmPassword) {
            throw new Error("Passwords do not match.");
        }
        await resetPassword(resetToken, password);
        setMessage("Your password has been reset successfully! You can now log in.");
        handleModeChange('login');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err: any) {
      setLocalError(err.message || 'An error occurred.');
    }
  };

  const currentError = localError || error;

  const renderContent = () => {
    if (mode === '2fa') {
        return (
             <>
                <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Enter the 6-digit code from your authenticator app.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="2fa-code" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Authentication Code</label>
                        <input id="2fa-code" type="text" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} required maxLength={6} className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-calm-blue-500 focus:border-transparent rounded-lg px-4 py-2 text-center text-2xl tracking-widest font-mono"/>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 bg-calm-blue-600 hover:bg-calm-blue-700 text-white font-bold rounded-lg transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
                        {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Verify'}
                    </button>
                    <button type="button" onClick={() => handleModeChange('login')} className="w-full text-center text-sm text-calm-blue-600 dark:text-calm-blue-400 hover:underline">
                        Back to Login
                    </button>
                </form>
            </>
        );
    }
    
    if (mode === 'forgotPassword' || mode === 'resetPassword') {
         return (
            <>
                <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
                    {mode === 'forgotPassword' ? 'Enter your email to receive a reset link.' : 'Enter your new password.'}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                     {mode === 'forgotPassword' ? (
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-calm-blue-500 focus:border-transparent rounded-lg px-4 py-2" placeholder="user@example.com"/>
                        </div>
                     ) : (
                        <>
                             <div>
                                <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-calm-blue-500 focus:border-transparent rounded-lg px-4 py-2" placeholder="••••••••"/>
                                <PasswordStrengthMeter password={password} />
                            </div>
                            <div>
                                <label htmlFor="confirm-password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                                <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-calm-blue-500 focus:border-transparent rounded-lg px-4 py-2" placeholder="••••••••"/>
                            </div>
                        </>
                     )}
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 bg-calm-blue-600 hover:bg-calm-blue-700 text-white font-bold rounded-lg transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
                        {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (mode === 'forgotPassword' ? 'Send Reset Link' : 'Reset Password')}
                    </button>
                    <button type="button" onClick={() => handleModeChange('login')} className="w-full text-center text-sm text-calm-blue-600 dark:text-calm-blue-400 hover:underline">
                        Back to Login
                    </button>
                </form>
            </>
        );
    }
    
    // Login and Signup view
    return (
        <>
            <div className="flex justify-center mb-6 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                <button onClick={() => handleModeChange('login')} className={`w-1/2 py-2 rounded-md font-semibold transition-colors ${mode === 'login' ? 'bg-white dark:bg-slate-800 text-calm-blue-600' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                    Login
                </button>
                <button onClick={() => handleModeChange('signup')} className={`w-1/2 py-2 rounded-md font-semibold transition-colors ${mode === 'signup' ? 'bg-white dark:bg-slate-800 text-calm-blue-600' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                    Sign Up
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => handleSocialLogin('google')} disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-2 px-4 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors">
                    <GoogleIcon /> <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Sign in with Google</span>
                </button>
                <button onClick={() => handleSocialLogin('github')} disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                    <GithubIcon /> <span className="text-sm font-medium">Sign in with GitHub</span>
                </button>
            </div>

            <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-600"></div>
                <span className="flex-shrink mx-4 text-xs text-slate-400 dark:text-slate-500">OR</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-600"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-calm-blue-500 focus:border-transparent rounded-lg px-4 py-2" placeholder="user@example.com"/>
                </div>
                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-calm-blue-500 focus:border-transparent rounded-lg px-4 py-2" placeholder="••••••••"/>
                    {mode === 'signup' && <PasswordStrengthMeter password={password} />}
                </div>
                 {mode === 'signup' && (
                    <div>
                        <label htmlFor="confirm-password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                        <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-calm-blue-500 focus:border-transparent rounded-lg px-4 py-2" placeholder="••••••••"/>
                    </div>
                )}
                {mode === 'login' && (
                     <div className="text-right">
                        <button type="button" onClick={() => handleModeChange('forgotPassword')} className="text-sm text-calm-blue-600 dark:text-calm-blue-400 hover:underline">
                            Forgot Password?
                        </button>
                    </div>
                )}
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 bg-calm-blue-600 hover:bg-calm-blue-700 text-white font-bold rounded-lg transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
                    {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (mode === 'login' ? 'Log In' : 'Create Account')}
                </button>
            </form>
        </>
    );
  };

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
        <AnimatePresence mode="wait">
            <motion.div
                key={mode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                {renderContent()}
            </motion.div>
        </AnimatePresence>
        
        <AnimatePresence>
            {(currentError || message) && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: '16px' }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className={`text-center text-sm ${currentError ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}
              >
                {currentError || message}
              </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Auth;