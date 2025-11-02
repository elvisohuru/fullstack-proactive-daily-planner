import React, { useEffect, Suspense, lazy } from 'react';
import { useAppStore } from './store/useAppStore';
import Auth from './components/Auth';
import CommandPalette from './components/CommandPalette';
import TaskTimer from './components/TaskTimer';
import ShutdownRoutine from './components/ShutdownRoutine';

const Planner = lazy(() => import('./Planner'));

const FullScreenLoader: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center text-white z-50">
    <div className="w-16 h-16 border-4 border-slate-500 border-t-calm-blue-500 rounded-full animate-spin mb-4"></div>
    <p className="text-lg tracking-wider">{message}</p>
  </div>
);

function App() {
  const { theme, checkAuth, isLoading, isAuthenticated, setCommandPaletteOpen } = useAppStore();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch(error => {
            console.log('ServiceWorker registration failed: ', error);
          });
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setCommandPaletteOpen]);

  if (isLoading) {
    return <FullScreenLoader message="Loading..." />;
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      {isAuthenticated ? (
        <Suspense fallback={<FullScreenLoader message="Loading Planner..." />}>
          <Planner />
        </Suspense>
      ) : (
        <Auth />
      )}
      
      {/* Global components that are available when authenticated */}
      {isAuthenticated && (
        <>
            <TaskTimer />
            <ShutdownRoutine />
            <CommandPalette />
        </>
      )}
    </div>
  );
}

export default App;