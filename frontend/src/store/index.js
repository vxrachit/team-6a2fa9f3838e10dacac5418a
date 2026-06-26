import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { token, user } = res.data;
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ user, token, isLoading: false });
          return { success: true };
        } catch (err) {
          const error = err.response?.data?.error || 'Login failed';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      },

      signup: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/signup', data);
          const { token, user } = res.data;
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ user, token, isLoading: false });
          return { success: true };
        } catch (err) {
          const error = err.response?.data?.error || 'Signup failed';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null });
      },

      updateUser: (user) => set({ user }),

      initAuth: () => {
        const { token } = get();
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      },

      updatePreferences: async (prefs) => {
        try {
          const res = await api.patch('/auth/preferences', prefs);
          set({ user: res.data.user });
        } catch (err) { console.error('Pref update failed:', err); }
      }
    }),
    { name: 'vins-auth', partialize: (state) => ({ user: state.user, token: state.token }) }
  )
);

// Theme Store
export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (t) => {
        let actualTheme = t;
        if (t === 'system') {
          actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        set({ theme: t });
        document.body.classList.toggle('light', actualTheme === 'light');
      },
      toggleTheme: () => {
        const current = get().theme;
        let next;
        if (current === 'system') {
          const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          next = isSystemDark ? 'light' : 'dark';
        } else {
          next = current === 'dark' ? 'light' : 'dark';
        }
        
        get().setTheme(next);
        
        // Sync with backend if user is logged in
        const { user, updatePreferences } = useAuthStore.getState();
        if (user) {
          updatePreferences({ ...user.preferences, theme: next });
        }
      },
      initTheme: () => {
        const { theme, setTheme } = get();
        setTheme(theme);
        
        // Listen to system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
          if (get().theme === 'system') {
            setTheme('system');
          }
        };
        
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handler);
        } else {
          mediaQuery.addListener(handler);
        }
      }
    }),
    { name: 'vins-theme' }
  )
);

// UI Store
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
}));
