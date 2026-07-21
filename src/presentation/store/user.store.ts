import { create } from 'zustand';
import type { User } from '../../domain/entities/user.entity';
import { 
  listUsersUseCase, 
  updateUserUseCase,
  createUserUseCase,
  deleteUserUseCase
} from '../../infrastructure/factories/user.factory';

interface UserState {
  users: User[];
  count: number;
  isLoading: boolean;
  error: string | null;
  fetchUsers: (limit?: number, offset?: number, search?: string) => Promise<void>;
  updateUserRole: (id: number, role: string) => Promise<void>;
  toggleUserStatus: (id: number, isActive: boolean) => Promise<void>;
  createUser: (data: Partial<User> & { password?: string, passwordConfirm?: string }) => Promise<void>;
  updateUser: (id: number, data: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
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

  createUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newUser = await createUserUseCase.execute(data);
      set((state) => ({
        users: [newUser, ...state.users],
        count: state.count + 1,
        isLoading: false,
      }));
    } catch (err: any) {
      const apiError = err.response?.data;
      const errorMsg = apiError?.detail || apiError?.username?.[0] || apiError?.email?.[0] || 'Error al crear el usuario';
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  updateUser: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await updateUserUseCase.execute(id, data);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updatedUser : u)),
        isLoading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al actualizar el usuario',
        isLoading: false,
      });
      throw err;
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteUserUseCase.execute(id);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        count: state.count - 1,
        isLoading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al eliminar el usuario',
        isLoading: false,
      });
      throw err;
    }
  },
}));
