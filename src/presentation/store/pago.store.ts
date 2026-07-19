// src/presentation/store/pago.store.ts
import { create } from 'zustand';
import type { Pago, PagoStats, PagoEstado, PagoMetodo } from '../../domain/entities/pago.entity';
import type { PagoFilters } from '../../domain/ports/pago.repository';
import {
  createPagoUseCase,
  getPagosUseCase,
  getPagoUseCase,
  updatePagoUseCase,
  deletePagoUseCase,
  getPagoStatsUseCase,
} from '../../infrastructure/factories/pago.factory';

interface PagoState {
  pagos: Pago[];
  selectedPago: Pago | null;
  stats: PagoStats | null;
  count: number;
  next: string | null;
  previous: string | null;
  filters: PagoFilters;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;

  fetchPagos: (filters?: PagoFilters) => Promise<void>;
  fetchPagoById: (id: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  createPago: (payload: Omit<Pago, 'id_pago' | 'fecha_pago'>) => Promise<boolean>;
  updatePagoStatus: (id: number, estado: PagoEstado) => Promise<boolean>;
  updatePago: (id: number, payload: Partial<Pago>) => Promise<boolean>;
  deletePago: (id: number) => Promise<boolean>;
  setFilters: (filters: Partial<PagoFilters>) => void;
  clearSelectedPago: () => void;
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

export const usePagoStore = create<PagoState>((set, get) => ({
  pagos: [],
  selectedPago: null,
  stats: null,
  count: 0,
  next: null,
  previous: null,
  filters: { page: 1, pageSize: 10 },
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,

  fetchPagos: async (filters) => {
    set({ isLoading: true, error: null });
    const currentFilters = { ...get().filters, ...filters };
    try {
      const result = await getPagosUseCase.execute(currentFilters);
      set({
        pagos: result.results,
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

  fetchPagoById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const pago = await getPagoUseCase.execute(id);
      set({ selectedPago: pago, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await getPagoStatsUseCase.execute();
      set({ stats });
    } catch (err) {
      console.error('Error fetching pago stats:', err);
    }
  },

  createPago: async (payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await createPagoUseCase.execute(payload);
      set({ successMessage: 'Pago registrado con éxito', isSaving: false });
      get().fetchPagos();
      get().fetchStats();
      return true;
    } catch (err) {
      set({ error: getErrorMessage(err), isSaving: false });
      return false;
    }
  },

  updatePagoStatus: async (id, estado) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const updated = await updatePagoUseCase.execute(id, { estado });
      set((state) => ({
        pagos: state.pagos.map((p) => (p.id_pago === id ? updated : p)),
        selectedPago: state.selectedPago?.id_pago === id ? updated : state.selectedPago,
        successMessage: 'Estado del pago actualizado',
        isSaving: false,
      }));
      get().fetchStats();
      return true;
    } catch (err) {
      set({ error: getErrorMessage(err), isSaving: false });
      return false;
    }
  },

  updatePago: async (id, payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const updated = await updatePagoUseCase.execute(id, payload);
      set((state) => ({
        pagos: state.pagos.map((p) => (p.id_pago === id ? updated : p)),
        selectedPago: state.selectedPago?.id_pago === id ? updated : state.selectedPago,
        successMessage: 'Pago actualizado con éxito',
        isSaving: false,
      }));
      get().fetchStats();
      return true;
    } catch (err) {
      set({ error: getErrorMessage(err), isSaving: false });
      return false;
    }
  },

  deletePago: async (id) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await deletePagoUseCase.execute(id);
      set((state) => ({
        pagos: state.pagos.filter((p) => p.id_pago !== id),
        selectedPago: state.selectedPago?.id_pago === id ? null : state.selectedPago,
        successMessage: 'Pago eliminado con éxito',
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

  clearSelectedPago: () => set({ selectedPago: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
