import axios, { AxiosError } from 'axios';
import type { ApiError } from '@teamboard/shared';

const TOKEN_KEY = 'teamboard.token';

/** Thin wrapper around localStorage for the JWT (docs/00 · ADR-004). */
export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

/** Single axios instance; base URL comes from env (VITE_API_URL includes /api). */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach the Bearer token to every request if we have one.
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A hook the AuthProvider registers so a 401 anywhere logs the user out cleanly.
let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (fn: () => void): void => {
  onUnauthorized = fn;
};

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && tokenStore.get()) {
      tokenStore.clear();
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);

/** Turn any axios/API error into a readable message for the UI. */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot reach the server. Is the API running?';
    }
  }
  return fallback;
}
