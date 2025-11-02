import React from 'react';

export type TaskPriority = 'high' | 'medium' | 'low' | 'none';

export type Task = {
  id: string;
  text: string;
  completed: boolean;
  goalId: string | null;
  priority: TaskPriority;
  tags: string[];
  dependsOn?: string[];
};

export type UnplannedTask = {
  id: string;
  text: string;
  createdAt: number;
};

export type TodaysPlan = {
  date: string;
  tasks: Task[];
};

export type LogEntry = {
  id: string;
  task: string;
  duration: number; // in seconds
  timestamp: number;
  dateString: string;
};

export type GoalCategory = 'Short Term' | 'Long Term';

export type Goal = {
  id: string;
  text: string;
  category: GoalCategory;
  completed: boolean;
  deadline: string | null;
  archived: boolean;
};

export type ActiveTask = {
  id: string; // The ID of the plan task or routine task
  type: 'plan' | 'routine'; // The type of task
  task: string;
  remainingSeconds: number;
  isPaused: boolean;
  totalDuration: number; // The original duration set for the timer
};

export type Reflection = {
  date: string;
  well: string;
  improve: string;
};

export type Theme = 'light' | 'dark';

export type RoutineTask = {
  id:string;
  text: string;
  completed: boolean;
  goalId: string | null;
  recurringDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  dependsOn?: string[];
};

export type PerformanceRecord = {
  date: string;
  score: number; // Percentage
};

export type Streak = {
  current: number;
  longest: number;
  lastActivityDate: string | null;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
};

// Represents the definition of an achievement, used for checking conditions.
export type AchievementDefinition = Omit<Achievement, 'unlocked'> & {
  condition: (state: any) => boolean; // Using `any` to avoid circular dependency with AppState
};


export type ShutdownStep = 'review' | 'reflect' | null;

export type ShutdownState = {
  isOpen: boolean;
  step: ShutdownStep;
  unfinishedTasks: Task[];
};