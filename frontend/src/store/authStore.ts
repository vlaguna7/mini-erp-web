import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  justLoggedIn: boolean;

  login: (user: User, token: string) => void;
  logout: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearJustLoggedIn: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthStore>((set) => {
  // ✅ Lê o localStorage ANTES do primeiro render — sem flash de deslogar
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken ?? null,
    isLoading: false,
    error: null,
    justLoggedIn: false,

    login: (user: User, token: string) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      set({ user, token, error: null, justLoggedIn: true });
    },

    logout: () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      set({ user: null, token: null, justLoggedIn: false });
    },

    setError: (error: string | null) => set({ error }),
    setLoading: (loading: boolean) => set({ isLoading: loading }),
    clearJustLoggedIn: () => set({ justLoggedIn: false }),

    // Mantido por compatibilidade, mas não é mais necessário
    initialize: () => {},
  };
});