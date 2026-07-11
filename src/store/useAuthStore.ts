import { create } from 'zustand';
import type { IUser } from '../types';
import { getToken, removeToken, setToken } from '../services/axios';
import { authService } from '../services/auth.service';

// ============================
// Auth Store
// ============================

interface AuthState {
  token: string | null;
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (token: string, user: IUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (token: string, user: IUser) => {
    setToken(token);
    set({
      token,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    removeToken();
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  initialize: () => {
    const token = getToken();
    if (token) {
      // Token exists — validate it by fetching user profile from backend
      authService
        .getProfile()
        .then((user) => {
          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        })
        .catch(() => {
          // Token is invalid or expired — clear it
          removeToken();
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        });
    } else {
      set({ isLoading: false });
    }
  },
}));
