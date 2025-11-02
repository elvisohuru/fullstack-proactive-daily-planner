
import { getTodayDateString } from './dateUtils';
// FIX: Import `Theme` to allow casting the string literal 'dark' to the correct type.
import { AuthResponse, User, AppDataState, Theme } from '../types';

// This is a mock API client. In a real application, this would make
// actual HTTP requests to a backend server. We simulate a database
// and server logic here.

const MOCK_DB = {
  users: new Map<string, { user: User, data: any, passwordHash: string }>(),
};

// Seed a default user for demonstration
const defaultUser = { 
    id: 'user-1', 
    email: 'user@example.com' 
};
MOCK_DB.users.set(defaultUser.email, {
    user: defaultUser,
    passwordHash: 'password123', // In a real app, this would be a secure hash
    data: {
      plan: { date: getTodayDateString(), tasks: [] },
      logs: [],
      goals: [],
      routine: [],
      unplannedTasks: [],
      reflections: [],
      performanceHistory: [],
      streak: { current: 0, longest: 0, lastActivityDate: null },
      unlockedAchievements: [],
      // FIX: Cast 'dark' to the `Theme` type to match AppDataState.
      theme: 'dark' as Theme,
      // FIX: Added missing properties to conform to AppDataState type
      activeTask: null,
      shutdownState: { isOpen: false, step: null, unfinishedTasks: [] },
      isCommandPaletteOpen: false,
      focusOnElement: null,
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

export const api = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    console.log(`Mock API: Attempting login for ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const account = MOCK_DB.users.get(email);
    if (!account || account.passwordHash !== password) {
      throw new Error('Invalid email or password.');
    }

    const token = generateToken(account.user.id);
    console.log('Mock API: Login successful.');
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

    const newUser: User = { id: `user-${MOCK_DB.users.size + 1}`, email };
    const newAccount = {
        user: newUser,
        passwordHash: password,
        data: {
            plan: { date: getTodayDateString(), tasks: [] },
            logs: [],
            goals: [],
            routine: [],
            unplannedTasks: [],
            reflections: [],
            performanceHistory: [],
            streak: { current: 0, longest: 0, lastActivityDate: null },
            unlockedAchievements: [],
            // FIX: Cast 'dark' to the `Theme` type to resolve the type incompatibility error.
            theme: 'dark' as Theme,
            // FIX: Added missing properties to conform to AppDataState type on line 99
            activeTask: null,
            shutdownState: { isOpen: false, step: null, unfinishedTasks: [] },
            isCommandPaletteOpen: false,
            focusOnElement: null,
        }
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
    
    // In a real app, we might issue a new token on bootstrap to refresh the session
    const newToken = generateToken(account.user.id);

    return {
      user: account.user,
      token: newToken,
      data: account.data
    };
  },
};