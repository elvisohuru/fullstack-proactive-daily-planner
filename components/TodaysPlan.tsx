
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Trash2, Play, Check, X, GripVertical, Flag, Tag, Link2, Info } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Task, TaskPriority } from '../types';
import { PREDEFINED_TAGS } from '../constants';

const priorityMap: { [key in TaskPriority]: { color: string, label: string } } = {
    high: { color: 'border-red-500', label: 'High' },
    medium: { color: 'border-yellow-500', label: 'Medium' },
    low: { color: 'border-blue-500', label: 'Low' },
    none: { color: 'border-transparent', label: 'None' },
};

const TodaysPlan: React.FC = () => {
  const [newTaskText, setNewTaskText] = useState('');
  const [newGoalId, setNewGoalId] = useState<string | null>(null);
  const [newPriority, setNewPriority] = useState<TaskPriority>('none');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  
  const [timerSetupTaskId, setTimerSetupTaskId] = useState<string | null>(null);
  const [timerDuration, setTimerDuration] = useState('60');
  const [editingDepsFor, setEditingDepsFor] = useState<string | null>(null);
  
  const tasks = useAppStore((state) => state.plan.tasks);
  const goals = useAppStore((state) => state.goals);
  const { addTask, deleteTask, toggleTask, startTimer, reorderTasks, updateTask, focusOnElement } = useAppStore();

  const newTaskInputRef = useRef<HTMLInputElement>(null);
  const tagContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusOnElement === 'new-task-input') {
      newTaskInputRef.current?.focus();
    }
  }, [focusOnElement]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagContainerRef.current && !tagContainerRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      addTask(newTaskText.trim(), newGoalId, newPriority, newTags);
      setNewTaskText('');
      setNewGoalId(null);
      setNewPriority('none');
      setNewTags([]);
      setTagInput('');
      setIsTagDropdownOpen(false);
    }
  };

  const handleTagSelect = (tag: string) => {
    if (!newTags.includes(tag)) {
      setNewTags([...newTags, tag]);
    }
    setTagInput('');
  };
  
  const handleTagRemove = (tagToRemove: string) => {
    setNewTags(newTags.filter(tag => tag !== tagToRemove));
  };
  
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    if (!isTagDropdownOpen) {
      setIsTagDropdownOpen(true);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,/g, '');
      if (newTag && !newTags.includes(newTag)) {
        setNewTags([...newTags, newTag]);
      }
      setTagInput('');
    }
  };

  const filteredPredefinedTags = PREDEFINED_TAGS.filter(
    (tag) => !newTags.includes(tag) && tag.toLowerCase().includes(tagInput.toLowerCase())
  );
  
  const handleStartTimerSetup = (taskId: string) => {
    setTimerSetupTaskId(taskId);
    setTimerDuration('60'); // Reset to default when opening
  };

  const handleDependencyChange = (taskId: string, dependencyId: string, isChecked: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const currentDeps = task.dependsOn || [];
    const newDeps = isChecked
      ? [...currentDeps, dependencyId]
      : currentDeps.filter(id => id !== dependencyId);

    updateTask(taskId, { dependsOn: newDeps });
  };
  
  const getBlockedByText = (task: Task): string => {
    if (!task.dependsOn) return '';
    const blockingTasks = task.dependsOn
      .map(depId => tasks.find(t => t.id === depId && !t.completed))
      .filter(Boolean);
    
    if (blockingTasks.length > 0) {
      return `Blocked by: ${blockingTasks.map(t => t?.text).join(', ')}`;
    }
    return '';
  };

  const handleConfirmStartTimer = (task: Task) => {
    const duration = parseInt(timerDuration, 10);
    if (!isNaN(duration) && duration > 0) {
      startTimer(task.id, 'plan', task.text, duration);
      setTimerSetupTaskId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Planned Tasks for Today</h2>
      <form onSubmit={handleAddTask} className="flex flex-col gap-2 mb-4">
        <div className="flex gap-2">
            <input
              id="new-task-input"
              ref={newTaskInputRef}
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add a new task..."
              className="flex-grow bg-slate-100 dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-calm-blue-500 focus:border-transparent rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200 transition"
            />
            <button
              type="submit"
              className="bg-calm-blue-500 hover:bg-calm-blue-600 text-white font-semibold p-2 rounded-lg flex items-center justify-center aspect-square transition"
              aria-label="Add Task"
            >
              <Plus size={20} />
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <select
                value={newGoalId || ''}
                onChange={(e) => setNewGoalId(e.target.value || null)}
                className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-300 border-transparent focus:ring-2 focus:ring-calm-blue-500 focus:border-transparent"
            >
                <option value="">No associated goal</option>
                {goals.filter(g => !g.completed && !g.archived).map(goal => (
                <option key={goal.id} value={goal.id}>🎯 {goal.text}</option>
                ))}
            </select>
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-sm items-center">
                <Flag size={14} className="text-slate-500" />
                 <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full bg-transparent text-slate-600 dark:text-slate-300 border-none focus:ring-0"
                >
                    <option value="none">No Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
        </div>
        <div className="relative" ref={tagContainerRef}>
          <div 
            onClick={() => setIsTagDropdownOpen(true)}
            className="flex gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-sm items-center flex-wrap cursor-text"
          >
              <Tag size={14} className="text-slate-500" />
              {newTags.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-calm-blue-200 dark:bg-calm-blue-800 text-calm-blue-800 dark:text-calm-blue-100 rounded px-2 py-0.5">
                  {tag}
                  <button type="button" onClick={() => handleTagRemove(tag)} className="hover:text-red-500"><X size={12}/></button>
                </span>
              ))}
              <input 
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  onFocus={() => setIsTagDropdownOpen(true)}
                  placeholder="Add tags..."
                  className="flex-grow bg-transparent text-slate-600 dark:text-slate-300 border-none focus:ring-0 p-0 h-auto"
              />
          </div>
          <AnimatePresence>
            {isTagDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute z-10 top-full mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg p-2 max-h-48 overflow-y-auto"
              >
                {tagInput.trim() && !newTags.includes(tagInput.trim()) && !PREDEFINED_TAGS.includes(tagInput.trim()) && (
                  <button type="button" onClick={() => handleTagSelect(tagInput.trim())} className="w-full text-left text-sm p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                    Create new tag: "{tagInput.trim()}"
                  </button>
                )}
                {filteredPredefinedTags.map(tag => (
                   <button type="button" key={tag} onClick={() => handleTagSelect(tag)} className="w-full text-left text-sm p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                    {tag}
                  </button>
                ))}
                {filteredPredefinedTags.length === 0 && !tagInput.trim() && (
                  <div className="p-2 text-xs text-slate-400">All tags added. Type to create new.</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
      <Reorder.Group as="ul" axis="y" values={tasks} onReorder={reorderTasks} className="space-y-2">
        <AnimatePresence>
          {tasks.map((task) => {
            const linkedGoal = task.goalId ? goals.find(g => g.id === task.goalId) : null;
            const isBlocked = task.dependsOn?.some(depId => !tasks.find(t => t.id === depId)?.completed) ?? false;

            return (
              <Reorder.Item
                key={task.id}
                value={task}
                as="li"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                className={`relative flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border-l-4 ${priorityMap[task.priority].color} ${isBlocked ? 'opacity-60' : 'cursor-grab active:cursor-grabbing'}`}
              >
                {!isBlocked && <GripVertical size={18} className="text-slate-400 flex-shrink-0" />}
                {isBlocked && <div className="w-[18px] flex-shrink-0" />}

                <button
                  onClick={() => !isBlocked && toggleTask(task.id)}
                  disabled={isBlocked}
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                    task.completed
                      ? 'bg-calm-green-500 border-calm-green-500'
                      : 'border-slate-300 dark:border-slate-500'
                  } ${!isBlocked && !task.completed ? 'hover:border-calm-blue-400' : ''} ${isBlocked ? 'cursor-not-allowed bg-slate-200 dark:bg-slate-600' : ''}`}
                  aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
                >
                  <AnimatePresence>
                    {task.completed && (
                      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                        <Check size={16} className="text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
                <div className={`flex-grow text-slate-700 dark:text-slate-300 ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                  <p>{task.text}</p>
                   <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {isBlocked && (
                        <div className="group relative flex items-center">
                            <span className="text-xs flex items-center gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded-full">
                                <Info size={12}/> Blocked
                            </span>
                             <div className="absolute bottom-full mb-2 w-max max-w-xs bg-slate-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {getBlockedByText(task)}
                            </div>
                        </div>
                      )}
                      {linkedGoal && (
                        <span className="text-xs bg-calm-blue-100 text-calm-blue-800 dark:bg-calm-blue-900 dark:text-calm-blue-200 px-2 py-0.5 rounded-full">
                          🎯 {linkedGoal.text}
                        </span>
                      )}
                      {task.tags.map(tag => (
                          <span key={tag} className="text-xs bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                              # {tag}
                          </span>
                      ))}
                  </div>
                </div>

                {timerSetupTaskId === task.id ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleConfirmStartTimer(task); }} className="flex items-center gap-1">
                      <input type="number" min="1" value={timerDuration} onChange={(e) => setTimerDuration(e.target.value)} className="w-16 bg-slate-200 dark:bg-slate-600 rounded-md px-2 py-1 text-sm text-center" autoFocus onKeyDown={(e) => { if (e.key === 'Escape') setTimerSetupTaskId(null); }} />
                      <span className="text-xs text-slate-500 dark:text-slate-400">min</span>
                      <button type="submit" className="text-calm-green-500 hover:text-calm-green-600 p-1"><Check size={18} /></button>
                      <button type="button" onClick={() => setTimerSetupTaskId(null)} className="text-slate-400 hover:text-slate-600 p-1"><X size={18} /></button>
                  </form>
                ) : (
                  <button onClick={() => !isBlocked && handleStartTimerSetup(task.id)} disabled={isBlocked} className="text-slate-400 p-1 disabled:cursor-not-allowed disabled:opacity-50 hover:text-calm-blue-500">
                    <Play size={18} />
                  </button>
                )}
                
                <div className="relative">
                    <button onClick={() => !isBlocked && setEditingDepsFor(editingDepsFor === task.id ? null : task.id)} disabled={isBlocked} className="text-slate-400 p-1 disabled:cursor-not-allowed disabled:opacity-50 hover:text-calm-blue-500">
                        <Link2 size={18} />
                    </button>
                    <AnimatePresence>
                    {editingDepsFor === task.id && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute z-20 right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3"
                        >
                            <p className="text-sm font-semibold mb-2">Depends on:</p>
                            <ul className="max-h-48 overflow-y-auto space-y-2">
                                {tasks.filter(t => t.id !== task.id).map(depTask => (
                                    <li key={depTask.id}>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" checked={task.dependsOn?.includes(depTask.id) ?? false} onChange={(e) => handleDependencyChange(task.id, depTask.id, e.target.checked)} className="rounded text-calm-blue-500 focus:ring-calm-blue-500" />
                                            <span className={depTask.completed ? 'line-through text-slate-400' : ''}>{depTask.text}</span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                             <button onClick={() => setEditingDepsFor(null)} className="mt-3 w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">Close</button>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
                
                <button onClick={() => deleteTask(task.id)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={18} /></button>
              </Reorder.Item>
            )
          })}
        </AnimatePresence>
      </Reorder.Group>
        {tasks.length === 0 && (
          <p className="text-center text-slate-500 dark:text-slate-400 py-4">No tasks yet. Add one to get started!</p>
        )}
    </div>
  );
};

export default TodaysPlan;
