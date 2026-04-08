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

export const selectAuthToken = (state) => state.token;
export const selectAuthUser = (state) => state.user;
export const selectIsAuthenticated = (state) => Boolean(state.token);
export const selectAuthLogin = (state) => state.login;
export const selectAuthLogout = (state) => state.logout;

export const useAuthStore = create(
  persist(
    (set) => ({
      ...initialAuthState,
      ...readLegacyAuth(),
      login(token, user = null) {
        clearLegacyAuthStorage();
        set({
          token,
          user,
        });
      },
      logout() {
        clearLegacyAuthStorage();
        set(initialAuthState);
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
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
