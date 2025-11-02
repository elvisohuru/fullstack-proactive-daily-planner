import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { BookText } from 'lucide-react';

const ReflectionTrigger: React.FC = () => {
  const { startShutdownRoutine } = useAppStore();

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg">
        <button
          onClick={startShutdownRoutine}
          className="w-full flex items-center justify-center gap-2 bg-calm-blue-500 hover:bg-calm-blue-600 text-white font-bold py-3 px-4 rounded-lg transition"
          aria-label="Wrap up day"
        >
          <BookText size={20} />
          Wrap Up Day
        </button>
    </div>
  );
};

export default ReflectionTrigger;