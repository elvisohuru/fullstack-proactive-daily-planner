import { getTodayDateString } from './dateUtils';
import { v4 as uuidv4 } from 'uuid';
import { AuthResponse, User, AppDataState, Theme, DashboardLayout, TimeAnalyticsData, ExportFormat, ExportJob, ExportStatus, Reflection, Task } from '../types';

// --- MOCK WEBSOCKET ---
// FIX: Re-implement WebSocket to be a simple event emitter to fix type issues with `.on()` and `.emit()`.
class MockWebSocket {
    private listeners: { [key: string]: Array<(...args: any[]) => void> } = {};
    private isConnected: boolean = false;
    // FIX: Changed NodeJS.Timeout to number for browser environments.
    private intervalId: number | null = null;
    
    connect(token: string) {
        if(this.isConnected) return;
        console.log('Mock WebSocket: Connecting with token...', token);
        this.isConnected = true;
    }

    disconnect() {
        if(!this.isConnected) return;
        console.log('Mock WebSocket: Disconnected.');
        this.isConnected = false;
    }

    on(event: string, callback: (...args: any[]) => void) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event: string, ...args: any[]) {
        const eventListeners = this.listeners[event];
        if (eventListeners) {
            eventListeners.forEach(callback => callback(...args));
        }
    }
}
export const mockWebSocket = new MockWebSocket();


// This is a mock API client. In a real application, this would make
// actual HTTP requests to a backend server. We simulate a database
// and server logic here.

type MockUserAccount = {
    user: User,
    data: any,
    passwordHash?: string, // Optional for OAuth users
    provider?: string,
    providerId?: string,
    resetToken?: string,
    resetTokenExpiry?: number,
    pushSubscriptions: PushSubscription[],
    exports: ExportJob[],
    twoFactorSecret?: string,
};

const MOCK_DB = {
  users: new Map<string, MockUserAccount>(),
};

// Seed a default user for demonstration
const defaultUser = { 
    id: 'user-1', 
    email: 'user@example.com',
    isTwoFactorEnabled: false,
};
MOCK_DB.users.set(defaultUser.email, {
    user: defaultUser,
    passwordHash: 'password123',
    pushSubscriptions: [],
    exports: [],
    data: {
      plan: { date: getTodayDateString(), tasks: [] },
      logs: [],
      goals: [],
      routine: [],
      unplannedTasks: [],
      reflections: { data: [
          { date: '2023-10-26', well: 'Finished the main feature.', improve: 'Start the documentation earlier.'},
          { date: '2023-10-25', well: 'Had a productive meeting about the project.', improve: 'Could have prepared more.'},
      ], nextCursor: undefined },
      performanceHistory: [],
      streak: { current: 0, longest: 0, lastActivityDate: null },
      unlockedAchievements: [],
      theme: 'dark' as Theme,
      activeTask: null,
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
    }
});


const generateToken = (userId: string) => `mock-jwt-for-${userId}-${Date.now()}`;

const getUserByToken = (token: string) => {
    if (!token || !token.startsWith('mock-jwt-for-')) return null;
    const userId = token.split('-')[3];
    for (const entry of MOCK_DB.users.values()) {
        if (entry.user.id === userId) {
            return entry;
        }
    }
    return null;
}

const generateIdempotencyKey = () => uuidv4();

const apiClient = {
  get: async (url: string) => { /* ... */ },
  post: async (url: string, body: any) => {
    const headers = {
        'Content-Type': 'application/json',
        'Idempotency-Key': generateIdempotencyKey(),
    };
    console.log(`Mock API POST to ${url} with headers:`, headers);
    // Actual fetch logic would go here
  },
  // ... other methods
}


export const api = {
  // --- AUTH ---
  login: async (email: string, password: string, twoFactorCode?: string): Promise<AuthResponse> => {
    console.log(`Mock API: Attempting login for ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const account = MOCK_DB.users.get(email);
    if (!account || account.passwordHash !== password) {
      throw new Error('Invalid email or password.');
    }

    if (account.user.isTwoFactorEnabled) {
      if (!twoFactorCode) {
        console.log('Mock API: 2FA is required for this account.');
        return { user: account.user, token: '', data: {} as AppDataState, twoFactorRequired: true };
      }
      // In a real app, you'd use a library like 'speakeasy' to verify the token.
      // We'll just simulate it.
      if (twoFactorCode !== '123456') {
        throw new Error('Invalid 2FA code.');
      }
    }

    const token = generateToken(account.user.id);
    console.log('Mock API: Login successful.');
    return {
      user: account.user,
      token,
      data: account.data,
    };
  },

  socialLogin: async (provider: 'google' | 'github'): Promise<AuthResponse> => {
    console.log(`Mock API: Simulating login with ${provider}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockEmail = `social_${provider}@example.com`;
    let account = MOCK_DB.users.get(mockEmail);

    if (!account) {
        console.log(`Mock API: Creating new user for ${provider} login.`);
        const newUser: User = { id: `user-${MOCK_DB.users.size + 1}`, email: mockEmail, isTwoFactorEnabled: false };
        account = {
            user: newUser,
            provider,
            providerId: `mock-${provider}-id-${newUser.id}`,
            pushSubscriptions: [],
            exports: [],
            data: { /* ... initialDataState ... */ }
        };
        MOCK_DB.users.set(mockEmail, account);
    }
    
    const token = generateToken(account.user.id);
    return {
        user: account.user,
        token,
        data: account.data,
    };
  },

  signup: async (email: string, password: string): Promise<AuthResponse> => {
    console.log(`Mock API: Attempting signup for ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (MOCK_DB.users.has(email)) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: User = { id: `user-${MOCK_DB.users.size + 1}`, email, isTwoFactorEnabled: false };
    const newAccount: MockUserAccount = {
        user: newUser,
        passwordHash: password,
        pushSubscriptions: [],
        exports: [],
        data: { /* ... initialDataState ... */ }
    };
    MOCK_DB.users.set(email, newAccount);
    
    const token = generateToken(newUser.id);
    console.log('Mock API: Signup successful.');
    return {
      user: newUser,
      token,
      data: newAccount.data,
    };
  },

  getBootstrapData: async (token: string): Promise<AuthResponse> => {
    console.log("Mock API: Fetching initial data with token...");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const account = getUserByToken(token);
    if (!account) {
      throw new Error("Invalid session token.");
    }
    
    const newToken = generateToken(account.user.id);
    account.data.twoFactorAuth.isEnabled = account.user.isTwoFactorEnabled;

    return {
      user: account.user,
      token: newToken,
      data: account.data
    };
  },

  forgotPassword: async (email: string): Promise<void> => {
    console.log(`Mock API: Requesting password reset for ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const account = MOCK_DB.users.get(email);
    if (account) {
        const token = `reset-token-for-${account.user.id}`;
        account.resetToken = token;
        account.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        console.log(`Mock API: Generated reset token for ${email}: ${token}.`);
        console.log(`Mock API: In a real app, an email would be sent. Simulated link: /?resetToken=${token}`);
    } else {
        console.log(`Mock API: No account found for ${email}, but not revealing this to the user.`);
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    console.log(`Mock API: Attempting to reset password with token ${token}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    for (const account of MOCK_DB.users.values()) {
        if (account.resetToken === token && account.resetTokenExpiry && account.resetTokenExpiry > Date.now()) {
            account.passwordHash = newPassword;
            account.resetToken = undefined;
            account.resetTokenExpiry = undefined;
            console.log(`Mock API: Password for ${account.user.email} has been reset.`);
            return;
        }
    }
    throw new Error("Invalid or expired reset token.");
  },

  // --- 2FA ---
  setup2FA: async (): Promise<{ secret: string, qrCode: string }> => {
    console.log("Mock API: Setting up 2FA");
    await new Promise(resolve => setTimeout(resolve, 500));
    const account = MOCK_DB.users.get(defaultUser.email);
    if (!account) throw new Error("User not found");
    const secret = 'MOCKSECRET1234567890'; // In real app, this would be unique
    account.twoFactorSecret = secret;
    // In a real app, use a library to generate this.
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/ProactivePlanner:${account.user.email}?secret=${secret}&issuer=ProactivePlanner`;
    return { secret, qrCode };
  },

  verifyAndEnable2FA: async (code: string): Promise<void> => {
    console.log("Mock API: Verifying 2FA code", code);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const account = MOCK_DB.users.get(defaultUser.email);
    if (!account || !account.twoFactorSecret) throw new Error("Setup process not started.");
    
    // Simulate verification
    if (code === '123456') {
      account.user.isTwoFactorEnabled = true;
      console.log("Mock API: 2FA enabled successfully.");
    } else {
      throw new Error("Invalid verification code.");
    }
  },

  disable2FA: async (): Promise<void> => {
    console.log("Mock API: Disabling 2FA");
    await new Promise(resolve => setTimeout(resolve, 1000));
    const account = MOCK_DB.users.get(defaultUser.email);
    if (account) {
        account.user.isTwoFactorEnabled = false;
        account.twoFactorSecret = undefined;
    }
  },

  // --- OTHERS ---
  saveDashboardLayout: async (layout: DashboardLayout): Promise<void> => {
    console.log("Mock API: Saving dashboard layout", layout);
    await new Promise(resolve => setTimeout(resolve, 300));
    const account = MOCK_DB.users.get(defaultUser.email);
    if (account) {
        account.data.dashboardLayout = layout;
    }
  },

  subscribeToPush: async (subscription: PushSubscription): Promise<void> => {
      console.log("Mock API: Subscribing to push notifications", subscription);
      await new Promise(resolve => setTimeout(resolve, 500));
      const account = MOCK_DB.users.get(defaultUser.email);
      if (account) {
          const exists = account.pushSubscriptions.some(s => s.endpoint === subscription.endpoint);
          if (!exists) {
              account.pushSubscriptions.push(subscription);
          }
      }
  },

  unsubscribeFromPush: async (endpoint: string): Promise<void> => {
       console.log("Mock API: Unsubscribing from push notifications", endpoint);
       await new Promise(resolve => setTimeout(resolve, 500));
       const account = MOCK_DB.users.get(defaultUser.email);
       if (account) {
           account.pushSubscriptions = account.pushSubscriptions.filter(s => s.endpoint !== endpoint);
       }
  },
  
  getTimeAnalytics: async (): Promise<TimeAnalyticsData> => {
      console.log("Mock API: Fetching time analytics");
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
          byGoal: [
              { goalId: 'goal-1', goalText: 'Learn React Native', duration: 7200 },
              { goalId: 'goal-2', goalText: 'Finish Q2 report', duration: 3650 },
          ],
          byTag: [
              { tag: 'work', duration: 4500 },
              { tag: 'learning', duration: 7200 },
              { tag: 'personal', duration: 1800 },
          ]
      };
  },
  
  requestExport: async (format: ExportFormat): Promise<void> => {
    console.log(`Mock API: Requesting export for ${format}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    apiClient.post('/v1/exports', { format });

    const account = MOCK_DB.users.get(defaultUser.email);
    if (!account) throw new Error("User not found");

    const newJob: ExportJob = {
      id: `job-${uuidv4()}`,
      format,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    account.exports.unshift(newJob);

    setTimeout(() => {
        const job = account.exports.find(j => j.id === newJob.id);
        if (job) {
            job.status = 'processing';
            mockWebSocket.emit('export:updated', job);
        }
    }, 2000);

    setTimeout(() => {
        const job = account.exports.find(j => j.id === newJob.id);
        if (job) {
            job.status = 'complete';
            job.downloadUrl = `/mock-download/${job.id}`;
            mockWebSocket.emit('export:updated', job);
        }
    }, 5000 + Math.random() * 3000);
  },

  fetchExports: async (cursor?: string): Promise<{ jobs: ExportJob[], nextCursor?: string }> => {
    console.log(`Mock API: Fetching exports with cursor: ${cursor}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const account = MOCK_DB.users.get(defaultUser.email);
    const allExports = account ? account.exports : [];
    const pageSize = 10;
    const startIndex = cursor ? allExports.findIndex(j => j.id === cursor) + 1 : 0;
    const jobs = allExports.slice(startIndex, startIndex + pageSize);
    const nextCursor = (startIndex + pageSize < allExports.length) ? jobs[jobs.length - 1]?.id : undefined;
    return { jobs, nextCursor };
  },

  fetchReflections: async (options?: { cursor?: string, search?: string }): Promise<{ reflections: Reflection[], nextCursor?: string }> => {
    const { cursor, search } = options || {};
    console.log(`Mock API: Fetching reflections with cursor: ${cursor}, search: ${search}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const account = MOCK_DB.users.get(defaultUser.email);
    let allReflections = account ? account.data.reflections.data : [];
    
    if (search) {
      allReflections = allReflections.filter(r => 
        r.well.toLowerCase().includes(search.toLowerCase()) || 
        r.improve.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const pageSize = 5;
    const startIndex = cursor ? allReflections.findIndex(r => r.date === cursor) + 1 : 0;
    const reflections = allReflections.slice(startIndex, startIndex + pageSize);
    const nextCursor = (startIndex + pageSize < allReflections.length) ? reflections[reflections.length - 1]?.date : undefined;
    
    return { reflections, nextCursor };
  },
};