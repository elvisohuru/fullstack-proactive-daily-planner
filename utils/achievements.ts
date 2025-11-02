import { Award, Star, Zap, Target as TargetIcon, Calendar, TrendingUp } from 'lucide-react';
import React from 'react';
import { getTodayDateString } from './dateUtils';
import { AchievementDefinition } from '../types';
import { AppState } from '../store/useAppStore';

export const achievementsList: AchievementDefinition[] = [
  {
    id: 'FIRST_TASK',
    name: 'First Step',
    description: 'Complete your very first task.',
    // FIX: Replaced JSX with React.createElement to be valid in a .ts file.
    icon: React.createElement(Star, { size: 24, className: "text-yellow-400" }),
    condition: (state: AppState) => (state.plan.tasks.some(t => t.completed) || state.routine.some(t => t.completed)),
  },
  {
    id: 'PERFECT_DAY',
    name: 'Perfectionist',
    description: 'Achieve a 100% productivity score for a day.',
    // FIX: Replaced JSX with React.createElement to be valid in a .ts file.
    icon: React.createElement(Award, { size: 24, className: "text-calm-blue-500" }),
    condition: (state: AppState) => state.performanceHistory.some(p => p.score === 100),
  },
  {
    id: 'STREAK_7',
    name: 'On a Roll',
    description: 'Maintain a 7-day productivity streak.',
    // FIX: Replaced JSX with React.createElement to be valid in a .ts file.
    icon: React.createElement(TrendingUp, { size: 24, className: "text-calm-green-500" }),
    condition: (state: AppState) => state.streak.current >= 7,
  },
  {
    id: 'GOAL_DIGGER',
    name: 'Goal Digger',
    description: 'Complete your first goal.',
    // FIX: Replaced JSX with React.createElement to be valid in a .ts file.
    icon: React.createElement(TargetIcon, { size: 24, className: "text-red-500" }),
    condition: (state: AppState) => state.goals.some(g => g.completed),
  },
  {
    id: 'PLANNER_PRO',
    name: 'Planner Pro',
    description: 'Add 10 or more tasks to a single day\'s plan.',
    // FIX: Replaced JSX with React.createElement to be valid in a .ts file.
    icon: React.createElement(Calendar, { size: 24, className: "text-purple-500" }),
    condition: (state: AppState) => state.plan.tasks.length >= 10,
  },
  {
    id: 'FOCUSED_5',
    name: 'Deep Focus',
    description: 'Log 5 hours of focused work in a single day.',
    // FIX: Replaced JSX with React.createElement to be valid in a .ts file.
    icon: React.createElement(Zap, { size: 24, className: "text-orange-500" }),
    condition: (state: AppState) => {
      const today = getTodayDateString();
      const totalSeconds = state.logs
        .filter(log => log.dateString === today)
        .reduce((sum, log) => sum + log.duration, 0);
      return totalSeconds >= 5 * 3600;
    },
  },
];
