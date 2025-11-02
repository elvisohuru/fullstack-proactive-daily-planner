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
  AppStateActions,
  DashboardLayout,
  ExportFormat,
  ExportJob,
  TwoFactorAuthState,
} from '../types';
import { achievementsList } from '../utils/achievements';
import { api, mockWebSocket } from '../utils/api';
import { STORAGE_KEYS } from '../constants';


export interface AppState extends AppDataState, AppStateActions {
  // Auth State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialDataState: AppDataState = {
    plan: { date: getTodayDateString(), tasks: [] },
    logs: [],
    goals: [],
    routine: [],
    unplannedTasks: [],
    activeTask: null,
    reflections: { data: [], nextCursor: undefined },
    performanceHistory: [],
    streak: { current: 0, longest: 0, lastActivityDate: null },
    unlockedAchievements: [],
    theme: 'dark' as Theme,
    shutdownState: { isOpen: false, step: null, unfinishedTasks: [] },
    isCommandPaletteOpen: false,
    focusOnElement: null,
    dashboardLayout: {
      left: ['ProductivityScore', 'ProductivityStreak', 'DailyRoutine', 'TodaysPlan'],
      right: ['MyGoals', 'UnplannedTasks', 'ReflectionTrigger', 'DataAndInsights', 'TimeLog', 'PerformanceHistory']
    },
    pushState: { isSubscribed: false, subscription: null, isSupported: false },
    timeAnalytics: null,
    exports: { data: [], nextCursor: undefined },
    twoFactorAuth: { isEnabled: false, isSetupModalOpen: false, setupSecret: null, setupQrCode: null },
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
                twoFactorAuth: { ...initialDataState.twoFactorAuth, isEnabled: response.user.isTwoFactorEnabled },
            });
            mockWebSocket.connect(token);
            get().checkAchievements();
            get().initializePush();
          } catch (e) {
            get().logout();
          }
        } else {
          set({ isLoading: false });
        }
      },

      login: async (email, password, twoFactorCode) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.login(email, password, twoFactorCode);
            if (response.twoFactorRequired) {
                set({ isLoading: false, error: null });
                return response; // Let the UI handle the 2FA step
            }
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
            set({
                ...response.data,
                user: response.user,
                token: response.token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                twoFactorAuth: { ...initialDataState.twoFactorAuth, isEnabled: response.user.isTwoFactorEnabled },
            });
            mockWebSocket.connect(response.token);
            get().checkAchievements();
            get().initializePush();
            return response;
        } catch(e) {
            const error = e instanceof Error ? e.message : 'Login failed';
            set({ isLoading: false, error, isAuthenticated: false });
            throw e;
        }
      },

      socialLogin: async (provider) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.socialLogin(provider);
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
            set({
                ...response.data,
                user: response.user,
                token: response.token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
            mockWebSocket.connect(response.token);
            get().checkAchievements();
            get().initializePush();
        } catch(e) {
            const error = e instanceof Error ? e.message : `Login with ${provider} failed`;
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
            mockWebSocket.connect(response.token);
            get().initializePush();
        } catch(e) {
            const error = e instanceof Error ? e.message : 'Signup failed';
            set({ isLoading: false, error, isAuthenticated: false });
            throw e;
        }
      },

      logout: () => {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        mockWebSocket.disconnect();
        set({
            ...initialDataState,
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.forgotPassword(email);
            set({ isLoading: false });
        } catch (e) {
            const error = e instanceof Error ? e.message : 'Request failed';
            set({ isLoading: false, error });
            throw e;
        }
      },

      resetPassword: async (token: string, password: string) => {
          set({ isLoading: true, error: null });
          try {
              await api.resetPassword(token, password);
              set({ isLoading: false });
          } catch (e) {
              const error = e instanceof Error ? e.message : 'Password reset failed';
              set({ isLoading: false, error });
              throw e;
          }
      },
      
      // --- 2FA ACTIONS ---
      open2FASetup: async () => {
        try {
          const { secret, qrCode } = await api.setup2FA();
          set(state => ({
            twoFactorAuth: {
              ...state.twoFactorAuth,
              isSetupModalOpen: true,
              setupSecret: secret,
              setupQrCode: qrCode,
            }
          }));
        } catch (error) {
          console.error("Failed to start 2FA setup:", error);
        }
      },
      
      close2FASetup: () => {
        set(state => ({
          twoFactorAuth: {
            ...state.twoFactorAuth,
            isSetupModalOpen: false,
            setupSecret: null,
            setupQrCode: null,
          }
        }));
      },
      
      verifyAndEnable2FA: async (code: string) => {
        try {
          await api.verifyAndEnable2FA(code);
          set(state => ({
            twoFactorAuth: {
              ...state.twoFactorAuth,
              isEnabled: true,
              isSetupModalOpen: false,
              setupSecret: null,
              setupQrCode: null,
            },
            user: state.user ? { ...state.user, isTwoFactorEnabled: true } : null,
          }));
        } catch (error) {
          console.error("Failed to verify 2FA code:", error);
          throw error;
        }
      },
      
      disable2FA: async () => {
        try {
          await api.disable2FA();
          set(state => ({
            twoFactorAuth: {
              ...state.twoFactorAuth,
              isEnabled: false,
            },
            user: state.user ? { ...state.user, isTwoFactorEnabled: false } : null,
          }));
        } catch (error) {
          console.error("Failed to disable 2FA:", error);
        }
      },


      // --- DASHBOARD AND PUSH ACTIONS ---

      updateDashboardLayout: (newLayout: DashboardLayout) => {
        set({ dashboardLayout: newLayout });
        api.saveDashboardLayout(newLayout); // Fire-and-forget
      },

      initializePush: async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          console.warn('Push notifications are not supported.');
          set(state => ({ pushState: { ...state.pushState, isSupported: false } }));
          return;
        }
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          set(state => ({
            pushState: {
              ...state.pushState,
              isSupported: true,
              isSubscribed: !!subscription,
              subscription: subscription
            }
          }));
        } catch (error) {
          console.error('Error during push initialization:', error);
          set(state => ({ pushState: { ...state.pushState, isSupported: false } }));
        }
      },
      
      subscribeToPushNotifications: async () => {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'BGl_eUAn82I-6PQTAmh0scL62o_pI5RkPnHlAb8Dopvdbnp-xy21-gUSJ92pL0oT9fPnHr_Qz_2X5nJDApSviXA'
          });
          await api.subscribeToPush(subscription);
          set(state => ({
            pushState: { ...state.pushState, isSubscribed: true, subscription }
          }));
        } catch (error) {
          console.error('Failed to subscribe to push notifications:', error);
        }
      },
      
      unsubscribeFromPushNotifications: async () => {
        const { pushState } = get();
        if (pushState.subscription) {
          try {
            await pushState.subscription.unsubscribe();
            await api.unsubscribeFromPush(pushState.subscription.endpoint);
            set(state => ({
              pushState: { ...state.pushState, isSubscribed: false, subscription: null }
            }));
          } catch (error) {
            console.error('Failed to unsubscribe:', error);
          }
        }
      },

      fetchTimeAnalytics: async () => {
        try {
          const analyticsData = await api.getTimeAnalytics();
          set({ timeAnalytics: analyticsData });
        } catch (error) {
          console.error('Failed to fetch time analytics:', error);
        }
      },
      
      requestExport: async (format: ExportFormat) => {
        try {
          await api.requestExport(format);
        } catch (error) {
          console.error(`Failed to request ${format} export:`, error);
        }
      },

      fetchExports: async (cursor) => {
        try {
          const { jobs, nextCursor } = await api.fetchExports(cursor);
           set(state => ({
            exports: {
              data: cursor ? [...state.exports.data, ...jobs] : jobs,
              nextCursor,
            }
          }));
        } catch (error) {
          console.error('Failed to fetch exports:', error);
        }
      },
      
      fetchReflections: async (options) => {
        try {
          const { reflections, nextCursor } = await api.fetchReflections(options);
          set(state => ({
            reflections: {
              data: options?.cursor ? [...state.reflections.data, ...reflections] : reflections,
              nextCursor,
            }
          }));
        } catch (error) {
          console.error('Failed to fetch reflections:', error);
        }
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
          reflections: {
            ...state.reflections,
            data: [newReflection, ...state.reflections.data.filter(r => r.date !== newReflection.date)]
          }
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
        const hasReflected = reflections.data.some(r => r.date === getTodayDateString());

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

// --- WebSocket Event Listener ---
// FIX: The `on` method did not exist on the mockWebSocket type. This is fixed in `utils/api.ts` by creating a manual event emitter.
mockWebSocket.on('export:updated', (updatedJob: ExportJob) => {
    console.log('WebSocket event received: export:updated', updatedJob);
    useAppStore.setState(state => ({
        exports: {
          ...state.exports,
          data: state.exports.data.map(job => job.id === updatedJob.id ? updatedJob : job),
        }
    }));
});