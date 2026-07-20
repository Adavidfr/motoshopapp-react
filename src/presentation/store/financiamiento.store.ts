// src/presentation/store/financiamiento.store.ts
import { create } from 'zustand';
import type { Financiamiento, FinanciamientoStats, FinanciamientoEstado } from '../../domain/entities/financiamiento.entity';
import type { FinanciamientoFilters } from '../../domain/ports/financiamiento.repository';
import {
  createFinanciamientoUseCase,
  getFinanciamientosUseCase,
  getFinanciamientoUseCase,
  updateFinanciamientoUseCase,
  deleteFinanciamientoUseCase,
  getFinanciamientoStatsUseCase,
} from '../../infrastructure/factories/financiamiento.factory';

interface FinanciamientoState {
  financiamientos: Financiamiento[];
  selectedFinanciamiento: Financiamiento | null;
  stats: FinanciamientoStats | null;
  count: number;
  next: string | null;
  previous: string | null;
  filters: FinanciamientoFilters;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;

  fetchFinanciamientos: (filters?: FinanciamientoFilters) => Promise<void>;
  fetchFinanciamientoById: (id: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  createFinanciamiento: (payload: Omit<Financiamiento, 'id_financiamiento'>) => Promise<boolean>;
  updateFinanciamientoStatus: (id: number, status: FinanciamientoEstado) => Promise<boolean>;
  updateFinanciamiento: (id: number, payload: Partial<Financiamiento>) => Promise<boolean>;
  deleteFinanciamiento: (id: number) => Promise<boolean>;
  setFilters: (filters: Partial<FinanciamientoFilters>) => void;
  clearSelectedFinanciamiento: () => void;
  clearMessages: () => void;
}

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as any;
    const data = axiosError.response?.data;
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
      if (data.error) return String(data.error);
      if (data.detail) return String(data.detail);
      const keys = Object.keys(data);
      if (keys.length > 0) {
        const val = data[keys[0]];
        return Array.isArray(val) ? String(val[0]) : String(val);
      }
    }
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado';
};

export const useFinanciamientoStore = create<FinanciamientoState>((set, get) => ({
  financiamientos: [],
  selectedFinanciamiento: null,
  stats: null,
  count: 0,
  next: null,
  previous: null,
  filters: { page: 1, pageSize: 10 },
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,

  fetchFinanciamientos: async (filters) => {
    set({ isLoading: true, error: null });
    const currentFilters = { ...get().filters, ...filters };
    try {
      const result = await getFinanciamientosUseCase.execute(currentFilters);
      set({
        financiamientos: result.results,
        count: result.count,
        next: result.next,
        previous: result.previous,
        filters: currentFilters,
        isLoading: false,
      });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  fetchFinanciamientoById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const fin = await getFinanciamientoUseCase.execute(id);
      set({ selectedFinanciamiento: fin, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await getFinanciamientoStatsUseCase.execute();
      set({ stats });
    } catch (err) {
      console.error('Error fetching financing stats:', err);
    }
  },

  createFinanciamiento: async (payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await createFinanciamientoUseCase.execute(payload);
      set({
        successMessage: 'Financiamiento registrado con éxito',
        isSaving: false,
      });
      get().fetchFinanciamientos();
      get().fetchStats();
      return true;
    } catch (err) {
      set({ error: getErrorMessage(err), isSaving: false });
      return false;
    }
  },

  updateFinanciamientoStatus: async (id, status) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const updated = await updateFinanciamientoUseCase.execute(id, { estado: status });
      set((state) => ({
        financiamientos: state.financiamientos.map((f) => (f.id_financiamiento === id ? updated : f)),
        selectedFinanciamiento: state.selectedFinanciamiento?.id_financiamiento === id ? updated : state.selectedFinanciamiento,
        successMessage: 'Estado de financiamiento actualizado',
        isSaving: false,
      }));
      get().fetchStats();
      return true;
    } catch (err) {
      set({ error: getErrorMessage(err), isSaving: false });
      return false;
    }
  },

  updateFinanciamiento: async (id, payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const updated = await updateFinanciamientoUseCase.execute(id, payload);
      set((state) => ({
        financiamientos: state.financiamientos.map((f) => (f.id_financiamiento === id ? updated : f)),
        selectedFinanciamiento: state.selectedFinanciamiento?.id_financiamiento === id ? updated : state.selectedFinanciamiento,
        successMessage: 'Financiamiento actualizado con éxito',
        isSaving: false,
      }));
      get().fetchStats();
      return true;
    } catch (err) {
      set({ error: getErrorMessage(err), isSaving: false });
      return false;
    }
  },

  deleteFinanciamiento: async (id) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await deleteFinanciamientoUseCase.execute(id);
      set((state) => ({
        financiamientos: state.financiamientos.filter((f) => f.id_financiamiento !== id),
        selectedFinanciamiento: state.selectedFinanciamiento?.id_financiamiento === id ? null : state.selectedFinanciamiento,
        successMessage: 'Financiamiento eliminado con éxito',
        isSaving: false,
      }));
      get().fetchStats();
      return true;
    } catch (err) {
      set({ error: getErrorMessage(err), isSaving: false });
      return false;
    }
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  clearSelectedFinanciamiento: () => set({ selectedFinanciamiento: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
