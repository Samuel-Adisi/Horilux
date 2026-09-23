import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  full_name: string;
}

interface AuthState {
  customer: Customer | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (customer: Customer, access: string, refresh: string) => void;
  setAccessToken: (access: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      customer: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (customer, access, refresh) =>
        set({ customer, accessToken: access, refreshToken: refresh }),
      setAccessToken: (access) => set({ accessToken: access }),
      logout: () => set({ customer: null, accessToken: null, refreshToken: null }),
    }),
    { name: "horilux-public-auth" }
  )
);
