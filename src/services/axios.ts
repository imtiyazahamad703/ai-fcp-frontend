import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { IApiResponse, IApiError } from '../types';

// ============================
// Shared Axios Instance
// ============================

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

const TOKEN_KEY = 'ai_fcp_token';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================
// Request Interceptor
// Attach JWT token to every request
// ============================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// ============================
// Response Interceptor
// Handle 401 (auto-logout) and normalize errors
// ============================

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<IApiError>) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }

    // Network error (no response from server)
    if (!error.response) {
      const networkError: IApiError = {
        success: false,
        statusCode: 0,
        message: 'Network error. Please check your connection.',
        errors: null,
        timestamp: new Date().toISOString(),
        path: error.config?.url || '',
      };
      return Promise.reject(networkError);
    }

    return Promise.reject(error.response.data);
  },
);

// ============================
// Helper Functions
// ============================

/**
 * Set the auth token in localStorage.
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove the auth token from localStorage.
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Get the stored auth token.
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Check if user is authenticated (has token).
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Type-safe API helpers
export const api = {
  get: <T>(url: string) =>
    apiClient.get<IApiResponse<T>>(url).then((res) => res.data),

  post: <T>(url: string, data?: unknown) =>
    apiClient.post<IApiResponse<T>>(url, data).then((res) => res.data),

  put: <T>(url: string, data?: unknown) =>
    apiClient.put<IApiResponse<T>>(url, data).then((res) => res.data),

  patch: <T>(url: string, data?: unknown) =>
    apiClient.patch<IApiResponse<T>>(url, data).then((res) => res.data),

  delete: <T>(url: string) =>
    apiClient.delete<IApiResponse<T>>(url).then((res) => res.data),
};

export default apiClient;
