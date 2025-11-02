import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Trash2, Check, Target, Archive, RefreshCw } from 'lucide-react';
import { getDeadlineCountdown } from '../utils/dateUtils';
import { Goal, GoalCategory } from '../types';
import { motion } from 'framer-motion';

const GoalItem: React.FC<{ 
    goal: Goal; 
    progress: number; 
    onToggle: (id: string) => void; 
    onArchive: (id: string) => void;
    onRestore: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ goal, progress, onToggle, onArchive, onRestore, onDelete }) => {
  const [countdown, setCountdown] = useState(getDeadlineCountdown(goal.deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getDeadlineCountdown(goal.deadline));
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [goal.deadline]);

  return (
    <li className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <button
        onClick={() => onToggle(goal.id)}
        disabled={goal.archived}
        className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
          goal.completed ? 'bg-calm-green-500 border-calm-green-500' : 'border-slate-300 dark:border-slate-500'
        } disabled:bg-slate-400 disabled:border-slate-400`}
      >
        {goal.completed && <Check size={12} className="text-white" />}
      </button>
      <div className="flex-grow">
        <div className="flex justify-between items-baseline">
          <p className={`text-slate-700 dark:text-slate-300 ${goal.completed || goal.archived ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
            {goal.text}
          </p>
          {!goal.completed && !goal.archived && <span className="text-xs font-semibold text-calm-blue-600 dark:text-calm-blue-400 ml-2">{Math.round(progress)}%</span>}
        </div>
        
        {!goal.completed && !goal.archived && (
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5 my-1.5">
            <motion.div 
              className="bg-calm-blue-500 h-1.5 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        )}
        
        {goal.deadline && !goal.completed && !goal.archived && <p className="text-xs text-slate-500 dark:text-slate-400">{countdown}</p>}
      </div>
      {goal.archived ? (
        <>
            <button onClick={() => onRestore(goal.id)} className="text-slate-400 hover:text-calm-blue-500 p-1 flex-shrink-0"><RefreshCw size={16} /></button>
            <button onClick={() => onDelete(goal.id)} className="text-slate-400 hover:text-red-500 p-1 flex-shrink-0"><Trash2 size={16} /></button>
        </>
      ) : (
        <button onClick={() => onArchive(goal.id)} className="text-slate-400 hover:text-calm-blue-500 p-1 flex-shrink-0"><Archive size={16} /></button>
      )}
    </li>
  );
};


const MyGoals: React.FC = () => {
  const { goals, addGoal, toggleGoal, archiveGoal, restoreGoal, permanentlyDeleteGoal, plan, routine, focusOnElement } = useAppStore();
  const [newGoalText, setNewGoalText] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Short Term');
  const [deadline, setDeadline] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  
  const newGoalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusOnElement === 'new-goal-input') {
      newGoalInputRef.current?.focus();
    }
  }, [focusOnElement]);


  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalText.trim()) {
      addGoal(newGoalText.trim(), category, deadline || null);
      setNewGoalText('');
      setDeadline('');
    }
  };

  const calculateGoalProgress = (goalId: string) => {
    const linkedTasks = plan.tasks.filter(t => t.goalId === goalId);
    const linkedRoutines = routine.filter(r => r.goalId === goalId);

    const totalItems = linkedTasks.length + linkedRoutines.length;
    if (totalItems === 0) return 0;

    const completedTasks = linkedTasks.filter(t => t.completed).length;
    const completedRoutines = linkedRoutines.filter(r => r.completed).length;
    const completedItems = completedTasks + completedRoutines;

    return (completedItems / totalItems) * 100;
  };

  const activeGoals = goals.filter(g => !g.archived);
  const archivedGoals = goals.filter(g => g.archived);
  const shortTermGoals = activeGoals.filter((g) => g.category === 'Short Term');
  const longTermGoals = activeGoals.filter((g) => g.category === 'Long Term');

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><Target size={20}/> My Goals</h2>
      <form onSubmit={handleAddGoal} className="space-y-3 mb-6">
        <input
          id="new-goal-input"
          ref={newGoalInputRef}
          type="text"
          value={newGoalText}
          onChange={(e) => setNewGoalText(e.target.value)}
          placeholder="Add a new goal..."
          className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200"
        />
        <div className="flex gap-2 flex-wrap">
          <select value={category} onChange={(e) => setCategory(e.target.value as GoalCategory)} className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-sm">
            <option>Short Term</option>
            <option>Long Term</option>
          </select>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="flex-grow bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-sm"
          />
          <button type="submit" className="bg-calm-blue-500 hover:bg-calm-blue-600 text-white font-semibold p-2 rounded-lg"><Plus size={20} /></button>
        </div>
      </form>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-slate-600 dark:text-slate-400 mb-2">Short Term</h3>
          <ul className="space-y-2">
            {shortTermGoals.length > 0 ? shortTermGoals.map(g => {
                const progress = calculateGoalProgress(g.id);
                return <GoalItem key={g.id} goal={g} progress={progress} onToggle={toggleGoal} onArchive={archiveGoal} onRestore={restoreGoal} onDelete={permanentlyDeleteGoal} />
            }) : <p className="text-sm text-slate-500">No short term goals yet.</p>}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-slate-600 dark:text-slate-400 mb-2">Long Term</h3>
           <ul className="space-y-2">
            {longTermGoals.length > 0 ? longTermGoals.map(g => {
                const progress = calculateGoalProgress(g.id);
                return <GoalItem key={g.id} goal={g} progress={progress} onToggle={toggleGoal} onArchive={archiveGoal} onRestore={restoreGoal} onDelete={permanentlyDeleteGoal} />
            }) : <p className="text-sm text-slate-500">No long term goals yet.</p>}
          </ul>
        </div>
        
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <button onClick={() => setShowArchived(!showArchived)} className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
                {showArchived ? 'Hide' : 'Show'} Archived Goals ({archivedGoals.length})
            </button>
            {showArchived && (
                 <ul className="space-y-2 mt-2">
                    {archivedGoals.length > 0 ? archivedGoals.map(g => (
                        <GoalItem key={g.id} goal={g} progress={100} onToggle={toggleGoal} onArchive={archiveGoal} onRestore={restoreGoal} onDelete={permanentlyDeleteGoal} />
                    )) : <p className="text-sm text-slate-500">No archived goals.</p>}
                </ul>
            )}
        </div>
      </div>
    </div>
  );
};

export default MyGoals;