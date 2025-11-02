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

// New types for customizable dashboards
export type DashboardComponentId = 'ProductivityScore' | 'ProductivityStreak' | 'DailyRoutine' | 'TodaysPlan' | 'MyGoals' | 'UnplannedTasks' | 'ReflectionTrigger' | 'DataAndInsights' | 'TimeLog' | 'PerformanceHistory';
export type DashboardLayout = {
  left: DashboardComponentId[];
  right: DashboardComponentId[];
};

// New types for Push Notifications
export type PushNotificationState = {
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  isSupported: boolean;
};

// New types for Time Analytics
export type TimeAnalyticsData = {
  byGoal: { goalId: string; goalText: string; duration: number }[];
  byTag: { tag: string; duration: number }[];
};

// New types for async exports
export type ExportFormat = 'json' | 'markdown' | 'csv-tasks' | 'csv-goals' | 'csv-routine' | 'csv-logs';
export type ExportStatus = 'pending' | 'processing' | 'complete' | 'failed';
export type ExportJob = {
  id: string;
  format: ExportFormat;
  status: ExportStatus;
  createdAt: string;
  downloadUrl?: string;
};

// New types for 2FA
export type TwoFactorAuthState = {
  isEnabled: boolean;
  isSetupModalOpen: boolean;
  setupSecret: string | null;
  setupQrCode: string | null;
};

// New type for App Data State to resolve circular dependency
export type AppDataState = {
  plan: TodaysPlan;
  logs: LogEntry[];
  goals: Goal[];
  routine: RoutineTask[];
  unplannedTasks: UnplannedTask[];
  activeTask: ActiveTask | null;
  reflections: { data: Reflection[], nextCursor?: string };
  performanceHistory: PerformanceRecord[];
  streak: Streak;
  unlockedAchievements: string[];
  theme: Theme;
  shutdownState: ShutdownState;
  isCommandPaletteOpen: boolean;
  focusOnElement: string | null;
  dashboardLayout: DashboardLayout;
  pushState: PushNotificationState;
  timeAnalytics: TimeAnalyticsData | null;
  exports: { data: ExportJob[], nextCursor?: string };
  twoFactorAuth: TwoFactorAuthState;
};

// New types for Authentication
export type User = {
  id: string;
  email: string;
  isTwoFactorEnabled: boolean;
};

export type AuthResponse = {
  user: User;
  token: string;
  data: AppDataState;
  twoFactorRequired?: boolean;
};

export type AppStateActions = {
  // Auth actions
  checkAuth: () => Promise<void>;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<AuthResponse>;
  signup: (email: string, password: string) => Promise<void>;
  socialLogin: (provider: 'google' | 'github') => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  // 2FA Actions
  open2FASetup: () => Promise<void>;
  close2FASetup: () => void;
  verifyAndEnable2FA: (code: string) => Promise<void>;
  disable2FA: () => Promise<void>;
  // Dashboard layout
  updateDashboardLayout: (newLayout: DashboardLayout) => void;
  // Push Notifications
  initializePush: () => void;
  subscribeToPushNotifications: () => Promise<void>;
  unsubscribeFromPushNotifications: () => Promise<void>;
  // Time Analytics
  fetchTimeAnalytics: () => Promise<void>;
  // Exports
  requestExport: (format: ExportFormat) => Promise<void>;
  fetchExports: (cursor?: string) => Promise<void>;
  // Reflections
  fetchReflections: (options?: { cursor?: string, search?: string }) => Promise<void>;
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