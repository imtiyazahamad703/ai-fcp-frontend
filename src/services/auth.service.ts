import { api, setToken, removeToken } from './axios';
import type { IAuthResponse, ILoginRequest, IRegisterRequest, IUser } from '../types';

// ============================
// Auth API Service
// ============================

export const authService = {
  /**
   * Login with email and password.
   */
  login: async (credentials: ILoginRequest): Promise<IAuthResponse> => {
    const response = await api.post<{ token: string; user: IUser }>(
      '/auth/login',
      credentials,
    );

    const { token, user } = response.data;
    setToken(token);

    return { token, user };
  },

  /**
   * Register a new user account.
   */
  register: async (data: IRegisterRequest): Promise<IAuthResponse> => {
    const response = await api.post<{ token: string; user: IUser }>(
      '/auth/register',
      data,
    );

    const { token, user } = response.data;
    setToken(token);

    return { token, user };
  },

  /**
   * Fetch the current authenticated user's profile.
   * Used to validate token on app initialization.
   */
  getProfile: async (): Promise<IUser> => {
    const response = await api.get<{ user: IUser }>('/auth/me');
    return response.data.user;
  },

  /**
   * Logout the current user.
   */
  logout: (): void => {
    removeToken();
    window.location.href = '/login';
  },
};
