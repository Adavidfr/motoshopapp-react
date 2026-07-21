import { create } from 'zustand';
import type { User } from '../../domain/entities/user.entity';
import { listUsersUseCase, updateUserUseCase } from '../../infrastructure/factories/user.factory';

interface UserState {
  users: User[];
  count: number;
  isLoading: boolean;
  error: string | null;
  fetchUsers: (limit?: number, offset?: number, search?: string) => Promise<void>;
  updateUserRole: (id: number, role: string) => Promise<void>;
  toggleUserStatus: (id: number, isActive: boolean) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  count: 0,
  isLoading: false,
  error: null,

  fetchUsers: async (limit = 10, offset = 0, search) => {
    set({ isLoading: true, error: null });
    try {
      const result = await listUsersUseCase.execute(limit, offset, search);
      set({ users: result.results, count: result.count, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al cargar usuarios',
        isLoading: false,
      });
    }
  },

  updateUserRole: async (id, role) => {
    set({ isLoading: true, error: null });
    try {
      const isStaff = role === 'admin';
      const updatedUser = await updateUserUseCase.execute(id, { role, isStaff });
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updatedUser : u)),
        isLoading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al actualizar el rol del usuario',
        isLoading: false,
      });
      throw err;
    }
  },

  toggleUserStatus: async (id, isActive) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await updateUserUseCase.execute(id, { isActive });
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updatedUser : u)),
        isLoading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al actualizar el estado del usuario',
        isLoading: false,
      });
      throw err;
    }
  },
}));
