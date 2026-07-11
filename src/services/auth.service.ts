import { api, setToken, removeToken } from './axios';
import type { IAuthResponse, ILoginRequest, IRegisterRequest } from '../types';

// ============================
// Auth API Service
// ============================

export const authService = {
  /**
   * Login with email and password.
   */
  login: async (credentials: ILoginRequest): Promise<IAuthResponse> => {
    const response = await api.post<IAuthResponse>('/auth/login', credentials);
    const authData = response.data;

    // Store token
    setToken(authData.token);

    return authData;
  },

  /**
   * Register a new user account.
   */
  register: async (data: IRegisterRequest): Promise<IAuthResponse> => {
    const response = await api.post<IAuthResponse>('/auth/register', data);
    const authData = response.data;

    // Store token
    setToken(authData.token);

    return authData;
  },

  /**
   * Logout the current user.
   */
  logout: (): void => {
    removeToken();
    window.location.href = '/login';
  },
};
