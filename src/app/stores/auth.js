import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const TOKEN_KEY = 'token';
const USER_KEY = 'user_profile';
const AUTH_STORAGE_KEY = 'app-auth';

function readStorageValue(key) {
  if (typeof window === 'undefined') {
    return '';
  }

  return localStorage.getItem(key) || '';
}

function readJson(key) {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearLegacyAuthStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function writeLegacyAuthStorage(token, user = null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

function readLegacyAuth() {
  return {
    token: readStorageValue(TOKEN_KEY),
    user: readJson(USER_KEY),
  };
}

const initialAuthState = {
  token: '',
  user: null,
};

function readPersistedAuth() {
  if (typeof window === 'undefined') {
    return {};
  }

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed?.state || {};
  } catch {
    return {};
  }
}

export function getStoredAuthToken() {
  const storeToken = useAuthStore.getState().token;
  if (storeToken) {
    return storeToken;
  }

  const persistedToken = readPersistedAuth().token;
  if (persistedToken) {
    return persistedToken;
  }

  return readStorageValue(TOKEN_KEY);
}

export const selectAuthToken = (state) => state.token;
export const selectAuthUser = (state) => state.user;
export const selectIsAuthenticated = (state) => Boolean(state.token);
export const selectAuthHydrated = (state) => state.hydrated;
export const selectAuthLogin = (state) => state.login;
export const selectAuthLogout = (state) => state.logout;

export const useAuthStore = create(
  persist(
    (set) => ({
      ...initialAuthState,
      ...readLegacyAuth(),
      hydrated: false,
      markHydrated() {
        set({ hydrated: true });
      },
      login(token, user = null) {
        writeLegacyAuthStorage(token, user);
        set({
          token,
          user,
          hydrated: true,
        });
      },
      logout() {
        clearLegacyAuthStorage();
        set({
          ...initialAuthState,
          hydrated: true,
        });
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated?.();
      },
      merge: (persistedState, currentState) => {
        const persisted = persistedState || {};
        const legacy = readLegacyAuth();
        const token = persisted.token || legacy.token || currentState.token;
        const user =
          persisted.user !== undefined ? persisted.user : legacy.user !== undefined ? legacy.user : currentState.user;

        return {
          ...currentState,
          ...persisted,
          token,
          user,
        };
      },
    },
  ),
);
