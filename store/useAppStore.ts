import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { getTodayDateString } from '../utils/dateUtils';
import {
  Task,
  TodaysPlan,
  LogEntry,
  Goal,
  GoalCategory,
  ActiveTask,
  Reflection,
  Theme,
  RoutineTask,
  PerformanceRecord,
  TaskPriority,
  UnplannedTask,
  Streak,
  ShutdownState,
  User,
  AuthResponse,
  AppDataState,
} from '../types';
import { achievementsList } from '../utils/achievements';
import { api } from '../utils/api';
import { STORAGE_KEYS } from '../constants';


export interface AppState extends AppDataState {
  // Auth State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
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
}

const initialDataState: AppDataState = {
    plan: { date: getTodayDateString(), tasks: [] },
    logs: [],
    goals: [],
    routine: [],
    unplannedTasks: [],
    activeTask: null,
    reflections: [],
    performanceHistory: [],
    streak: { current: 0, longest: 0, lastActivityDate: null },
    unlockedAchievements: [],
    theme: 'dark' as Theme,
    shutdownState: { isOpen: false, step: null, unfinishedTasks: [] },
    isCommandPaletteOpen: false,
    focusOnElement: null,
};


export const useAppStore = create<AppState>()(
    (set, get) => ({
      ...initialDataState,
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      
      // --- AUTH ACTIONS ---
      checkAuth: async () => {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          try {
            const response = await api.getBootstrapData(token);
            set({
                ...response.data,
                user: response.user,
                token: response.token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
            get().checkAchievements();
          } catch (e) {
            // Token is invalid or expired
            get().logout();
          }
        } else {
          set({ isLoading: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.login(email, password);
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
            set({
                ...response.data,
                user: response.user,
                token: response.token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
            get().checkAchievements();
        } catch(e) {
            const error = e instanceof Error ? e.message : 'Login failed';
            set({ isLoading: false, error, isAuthenticated: false });
            throw e;
        }
      },
      
      signup: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.signup(email, password);
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
            set({
                ...response.data,
                user: response.user,
                token: response.token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch(e) {
            const error = e instanceof Error ? e.message : 'Signup failed';
            set({ isLoading: false, error, isAuthenticated: false });
            throw e;
        }
      },

      logout: () => {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        set({
            ...initialDataState,
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
      },

      // --- APP ACTIONS ---
      addTask: (text, goalId, priority, tags) => {
        const newTask: Task = { id: uuidv4(), text, completed: false, goalId, priority, tags, dependsOn: [] };
        set((state) => ({
          plan: { ...state.plan, tasks: [...state.plan.tasks, newTask] },
        }));
        get().checkAchievements();
      },
      
      updateTask: (id, updates) => {
        set(state => ({
          plan: {
            ...state.plan,
            tasks: state.plan.tasks.map(task => 
              task.id === id ? { ...task, ...updates } : task
            ),
          },
        }));
      },

      toggleTask: (id) => {
        set((state) => {
          const updatedTasks = state.plan.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          );
      
          const finalTasks = updatedTasks.map(task => {
            if (task.dependsOn?.includes(id)) {
              return { ...task };
            }
            return task;
          });
      
          return {
            plan: {
              ...state.plan,
              tasks: finalTasks,
            },
          };
        });
        get().checkAchievements();
      },

      deleteTask: (id) => {
        set((state) => ({
          plan: { ...state.plan, tasks: state.plan.tasks.filter((task) => task.id !== id) },
        }));
      },
      
      reorderTasks: (tasks) => {
        set((state) => ({
          plan: { ...state.plan, tasks },
        }));
      },
      
      linkTaskToGoal: (taskId, goalId) => {
        set((state) => ({
          plan: {
            ...state.plan,
            tasks: state.plan.tasks.map((task) =>
              task.id === taskId ? { ...task, goalId } : task
            ),
          },
        }));
      },

      startTimer: (id, type, task, durationMinutes) => {
        const durationSeconds = durationMinutes * 60;
        set({
          activeTask: {
            id,
            type,
            task,
            remainingSeconds: durationSeconds,
            totalDuration: durationSeconds,
            isPaused: false,
          },
        });
      },
      
      updateTimer: (updates) => {
        set((state) => ({
          activeTask: state.activeTask ? { ...state.activeTask, ...updates } : null,
        }));
      },

      finishTimer: () => {
        const { activeTask } = get();
        if (activeTask) {
          get().addLog({ task: activeTask.task, duration: activeTask.totalDuration });
          set({ activeTask: null });
        }
      },
      
      completeActiveTask: () => {
        const { activeTask, toggleTask, toggleRoutineTask, addLog } = get();
        if (activeTask) {
          const timeSpent = activeTask.totalDuration - activeTask.remainingSeconds;
          if (timeSpent > 0) {
            addLog({ task: activeTask.task, duration: timeSpent });
          }

          if (activeTask.type === 'plan') {
            toggleTask(activeTask.id);
          } else if (activeTask.type === 'routine') {
            toggleRoutineTask(activeTask.id, true);
          }

          set({ activeTask: null });
        }
      },

      extendTimer: (minutes) => {
        set((state) => {
          if (!state.activeTask) return {};
          const additionalSeconds = minutes * 60;
          return {
            activeTask: {
              ...state.activeTask,
              remainingSeconds: state.activeTask.remainingSeconds + additionalSeconds,
              totalDuration: state.activeTask.totalDuration + additionalSeconds,
              isPaused: false,
            },
          };
        });
      },

      addLog: (log) => {
        const newLog: LogEntry = {
          ...log,
          id: uuidv4(),
          timestamp: Date.now(),
          dateString: getTodayDateString(),
        };
        set((state) => ({ logs: [newLog, ...state.logs] }));
        get().checkAchievements();
      },

      addGoal: (text, category, deadline) => {
        const newGoal: Goal = {
          id: uuidv4(),
          text,
          category,
          deadline,
          completed: false,
          archived: false,
        };
        set((state) => ({ goals: [...state.goals, newGoal] }));
      },

      toggleGoal: (id) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, completed: !goal.completed } : goal
          ),
        }));
        get().checkAchievements();
      },

      archiveGoal: (id) => {
         set(state => ({
             goals: state.goals.map(g => g.id === id ? { ...g, archived: true } : g)
         }))
      },

      restoreGoal: (id) => {
         set(state => ({
             goals: state.goals.map(g => g.id === id ? { ...g, archived: false } : g)
         }))
      },
      
      permanentlyDeleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        }));
      },

      addRoutineTask: (text, goalId, recurringDays) => {
        const newRoutineTask: RoutineTask = { id: uuidv4(), text, completed: false, goalId, recurringDays, dependsOn: [] };
        set((state) => ({
          routine: [...state.routine, newRoutineTask],
        }));
      },

      toggleRoutineTask: (id, skipLog = false) => {
        const { routine, addLog } = get();
        const taskToToggle = routine.find((task) => task.id === id);

        if (!skipLog && taskToToggle && !taskToToggle.completed) {
          addLog({ task: taskToToggle.text, duration: 0 });
        }
        
        set((state) => {
          const updatedRoutine = state.routine.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          );
          
          const finalRoutine = updatedRoutine.map(task => {
            if (task.dependsOn?.includes(id)) {
              return { ...task }; // Create a new object reference
            }
            return task;
          });

          return {
            routine: finalRoutine
          };
        });
        get().checkAchievements();
      },
      
      updateRoutineTask: (id, updates) => {
        set(state => ({
          routine: state.routine.map(task => 
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      deleteRoutineTask: (id) => {
        set((state) => ({
          routine: state.routine.filter((task) => task.id !== id),
        }));
      },
      
      reorderRoutine: (routine) => {
        set({ routine });
      },
      
      addUnplannedTask: (text) => {
        const task: UnplannedTask = { id: uuidv4(), text, createdAt: Date.now() };
        set(state => ({ unplannedTasks: [task, ...state.unplannedTasks] }));
      },
      
      planUnplannedTask: (id) => {
        const { unplannedTasks, addTask } = get();
        const taskToPlan = unplannedTasks.find(t => t.id === id);
        if(taskToPlan) {
            addTask(taskToPlan.text, null, 'none', []);
            set(state => ({ unplannedTasks: state.unplannedTasks.filter(t => t.id !== id) }));
        }
      },
      
      deleteUnplannedTask: (id) => {
        set(state => ({ unplannedTasks: state.unplannedTasks.filter(t => t.id !== id) }));
      },

      addReflection: (well, improve) => {
        const newReflection: Reflection = {
          date: getTodayDateString(),
          well,
          improve,
        };
        set((state) => ({
          reflections: [newReflection, ...state.reflections.filter(r => r.date !== newReflection.date)]
        }));
        get().closeShutdownRoutine();
      },
      
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        }));
      },
      
      startShutdownRoutine: () => {
        const { plan, reflections } = get();
        const unfinishedTasks = plan.tasks.filter(t => !t.completed);
        const hasReflected = reflections.some(r => r.date === getTodayDateString());

        if (unfinishedTasks.length > 0) {
            set({ shutdownState: { isOpen: true, step: 'review', unfinishedTasks } });
        } else if (!hasReflected) {
            set({ shutdownState: { isOpen: true, step: 'reflect', unfinishedTasks: [] } });
        } else {
            get().closeShutdownRoutine();
        }
      },

      processUnfinishedTasks: () => {
          const { shutdownState, addUnplannedTask, plan } = get();
          const newUnplannedTasks = shutdownState.unfinishedTasks.map(t => ({ id: uuidv4(), text: t.text, createdAt: Date.now() }));
          
          set(state => ({
              unplannedTasks: [...newUnplannedTasks, ...state.unplannedTasks],
              plan: { ...plan, tasks: plan.tasks.filter(t => t.completed) },
              shutdownState: { ...state.shutdownState, step: 'reflect' }
          }));
      },
      
      setShutdownStep: (step) => {
        set(state => ({ shutdownState: { ...state.shutdownState, step } }));
      },

      closeShutdownRoutine: () => {
        set({ shutdownState: { isOpen: false, step: null, unfinishedTasks: [] } });
      },

      setCommandPaletteOpen: (isOpen) => {
        set({ isCommandPaletteOpen: isOpen });
      },

      setFocusOnElement: (elementId) => {
        set({ focusOnElement: elementId });
        if (elementId) {
            setTimeout(() => set({ focusOnElement: null }), 100);
        }
      },

      checkAchievements: () => {
        const state = get();
        const newlyUnlocked = achievementsList
          .filter(ach => !state.unlockedAchievements.includes(ach.id))
          .filter(ach => ach.condition(state))
          .map(ach => ach.id);
        
        if (newlyUnlocked.length > 0) {
          set(s => ({ unlockedAchievements: [...s.unlockedAchievements, ...newlyUnlocked] }));
        }
      },
    })
);