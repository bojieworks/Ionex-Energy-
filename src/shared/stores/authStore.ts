import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  getIsAuthenticated: () => boolean;
  setTokens: (tokens: Partial<Pick<AuthState, "accessToken" | "refreshToken">>) => void;
  login: (tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
};

export const authStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      getIsAuthenticated: () => !!get().accessToken,
      setTokens: (tokens) => set((state) => ({ ...state, ...tokens })),
      login: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),
      logout: () => set({ accessToken: null, refreshToken: null }),
    }),
    {
      name: "lonex-auth",
      partialize: (state) => ({ accessToken: state.accessToken, refreshToken: state.refreshToken }),
    },
  ),
);
