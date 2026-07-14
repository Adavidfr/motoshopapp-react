// src/presentation/store/auth.store.ts
import { create } from 'zustand';
import type { User } from '../../domain/entities/user.entity';
import type { LoginDto, RegisterDto } from '../../application/dtos/auth.dto';
import { loginUseCase, registerUseCase, logoutUseCase } from '../../infrastructure/factories/auth.factory';
import { LocalTokenStorage } from '../../infrastructure/storage/local-token-storage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: () => {
    const token = LocalTokenStorage.getAccessToken();
    // Para simplificar en esta fase, si hay un token guardado lo consideramos autenticado.
    // En producción se realizaría una validación del token con verifyToken.
    if (token) {
      // Intentamos recuperar datos básicos del usuario del storage si estuviesen guardados,
      // o simplemente marcamos como autenticado.
      const storedUser = localStorage.getItem('motoshop_user');
      set({
        isAuthenticated: true,
        user: storedUser ? JSON.parse(storedUser) : null,
      });
    }
  },

  login: async (dto) => {
    set({ isLoading: true, error: null });
    try {
      const response = await loginUseCase.execute(dto);
      LocalTokenStorage.setTokens(response.tokens);
      localStorage.setItem('motoshop_user', JSON.stringify(response.user));
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Credenciales inválidas',
        isLoading: false,
      });
      throw err;
    }
  },

  register: async (dto) => {
    set({ isLoading: true, error: null });
    try {
      await registerUseCase.execute(dto);
      set({ isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.username?.[0] || err.response?.data?.email?.[0] || 'Error en el registro',
        isLoading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutUseCase.execute();
    } catch {
      // Ignoramos error del endpoint y limpiamos localmente igualmente
    } finally {
      LocalTokenStorage.clearTokens();
      localStorage.removeItem('motoshop_user');
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

// Escuchar evento de expiración de token para desloguear
if (typeof window !== 'undefined') {
  window.addEventListener('auth-session-expired', () => {
    useAuthStore.getState().logout();
  });
}
