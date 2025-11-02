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

// New type for App Data State to resolve circular dependency
export type AppDataState = {
  plan: TodaysPlan;
  logs: LogEntry[];
  goals: Goal[];
  routine: RoutineTask[];
  unplannedTasks: UnplannedTask[];
  activeTask: ActiveTask | null;
  reflections: Reflection[];
  performanceHistory: PerformanceRecord[];
  streak: Streak;
  unlockedAchievements: string[];
  theme: Theme;
  shutdownState: ShutdownState;
  isCommandPaletteOpen: boolean;
  focusOnElement: string | null;
};

// New types for Authentication
export type User = {
  id: string;
  email: string;
};

export type AuthResponse = {
  user: User;
  token: string;
  // FIX: Replaced Omit<AppState, ...> with AppDataState to avoid circular dependency.
  data: AppDataState;
};

export type AppStateActions = {
  // Auth actions
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  // Other actions...
  addTask: (text: string, goalId: string | null, priority: TaskPriority, tags: string[]) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Pick<Task, 'priority' | 'tags' | 'dependsOn'>>) => void;
  reorderTasks: (tasks: Task[]) => void;
  linkTaskToGoal: (taskId: string, goalId: string | null) => void;
  startTimer: (id: string, type: 'plan' | 'routine', task: string, durationMinutes: number) => void;
  updateTimer: (updates: Partial<ActiveTask>) => void;
  finishTimer: () => void;
  completeActiveTask: () => void;
  extendTimer: (minutes: number) => void;
  addLog: (log: Omit<LogEntry, 'id'|'timestamp'|'dateString'>) => void;
  addGoal: (text: string, category: GoalCategory, deadline: string | null) => void;
  toggleGoal: (id: string) => void;
  archiveGoal: (id: string) => void;
  restoreGoal: (id: string) => void;
  permanentlyDeleteGoal: (id: string) => void;
  addRoutineTask: (text: string, goalId: string | null, recurringDays: number[]) => void;
  toggleRoutineTask: (id: string, skipLog?: boolean) => void;
  updateRoutineTask: (id: string, updates: Partial<Pick<RoutineTask, 'dependsOn'>>) => void;
  deleteRoutineTask: (id: string) => void;
  reorderRoutine: (routine: RoutineTask[]) => void;
  addUnplannedTask: (text: string) => void;
  planUnplannedTask: (id: string) => void;
  deleteUnplannedTask: (id: string) => void;
  addReflection: (well: string, improve: string) => void;
  toggleTheme: () => void;
  startShutdownRoutine: () => void;
  processUnfinishedTasks: () => void;
  closeShutdownRoutine: () => void;
  setShutdownStep: (step: 'review' | 'reflect') => void;
  setCommandPaletteOpen: (isOpen: boolean) => void;
  setFocusOnElement: (elementId: string | null) => void;
  checkAchievements: () => void;
};