import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  token: string | null;
  setAuth: (token: string, user: any) => void;  // ← AJOUTE
  logout: () => void;
}

export const useAuthStore = create<<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  setAuth: (token, user) => set({ isAuthenticated: true, token, user }),  // ← AJOUTE
  logout: () => set({ isAuthenticated: false, token: null, user: null }),
}));

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true }),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: "esatic-auth" }
  )
);
