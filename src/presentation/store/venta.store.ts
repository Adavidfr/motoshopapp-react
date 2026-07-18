// src/presentation/store/venta.store.ts
import { create } from 'zustand';
import type { Venta, VentaStats, VentaEstado } from '../../domain/entities/venta.entity';
import type { VentaFilters } from '../../domain/ports/venta.repository';
import type { Financiamiento } from '../../domain/entities/financiamiento.entity';
import {
  createVentaUseCase,
  getVentasUseCase,
  getVentaUseCase,
  updateVentaUseCase,
  deleteVentaUseCase,
  getVentaStatsUseCase,
  financiarVentaUseCase,
} from '../../infrastructure/factories/venta.factory';

interface VentaState {
  ventas: Venta[];
  selectedVenta: Venta | null;
  stats: VentaStats | null;
  count: number;
  next: string | null;
  previous: string | null;
  filters: VentaFilters;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;

  fetchVentas: (filters?: VentaFilters) => Promise<void>;
  fetchVentaById: (id: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  createVenta: (payload: { id_pedido: number; total_venta: string; estado: string }) => Promise<boolean>;
  updateVentaStatus: (id: number, status: VentaEstado) => Promise<boolean>;
  deleteVenta: (id: number) => Promise<boolean>;
  financiarVenta: (id: number, payload: Omit<Financiamiento, 'id_financiamiento' | 'id_venta'>) => Promise<boolean>;
  setFilters: (filters: Partial<VentaFilters>) => void;
  clearSelectedVenta: () => void;
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

export const useVentaStore = create<VentaState>((set, get) => ({
  ventas: [],
  selectedVenta: null,
  stats: null,
  count: 0,
  next: null,
  previous: null,
  filters: { page: 1, pageSize: 10 },
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,

  fetchVentas: async (filters) => {
    set({ isLoading: true, error: null });
    const currentFilters = { ...get().filters, ...filters };
    try {
      const result = await getVentasUseCase.execute(currentFilters);
      set({
        ventas: result.results,
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

  fetchVentaById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const venta = await getVentaUseCase.execute(id);
      set({ selectedVenta: venta, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await getVentaStatsUseCase.execute();
      set({ stats });
    } catch (err) {
      console.error('Error fetching venta stats:', err);
    }
  },

  createVenta: async (payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await createVentaUseCase.execute(payload);
      set({
        successMessage: 'Venta registrada con éxito',
        isSaving: false,
      });
      get().fetchVentas();
      get().fetchStats();
      return true;
    } catch (err) {
      set({ error: getErrorMessage(err), isSaving: false });
      return false;
    }
  },

  updateVentaStatus: async (id, status) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const updated = await updateVentaUseCase.execute(id, { estado: status });
      set((state) => ({
        ventas: state.ventas.map((v) => (v.id_venta === id ? updated : v)),
        selectedVenta: state.selectedVenta?.id_venta === id ? updated : state.selectedVenta,
        successMessage: 'Estado de venta actualizado',
        isSaving: false,
      }));
      get().fetchStats();
      return true;
    } catch (err) {
      set({ error: getErrorMessage(err), isSaving: false });
      return false;
    }
  },

  deleteVenta: async (id) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await deleteVentaUseCase.execute(id);
      set((state) => ({
        ventas: state.ventas.filter((v) => v.id_venta !== id),
        selectedVenta: state.selectedVenta?.id_venta === id ? null : state.selectedVenta,
        successMessage: 'Venta anulada con éxito',
        isSaving: false,
      }));
      get().fetchStats();
      return true;
    } catch (err) {
      set({ error: getErrorMessage(err), isSaving: false });
      return false;
    }
  },

  financiarVenta: async (id, payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const newFin = await financiarVentaUseCase.execute(id, payload);
      set((state) => {
        if (state.selectedVenta && state.selectedVenta.id_venta === id) {
          const updatedVenta = {
            ...state.selectedVenta,
            num_financiamientos: state.selectedVenta.num_financiamientos + 1,
            financiamientos: [...(state.selectedVenta.financiamientos || []), newFin],
          };
          return {
            selectedVenta: updatedVenta,
            ventas: state.ventas.map((v) => (v.id_venta === id ? updatedVenta : v)),
            successMessage: 'Financiamiento agregado con éxito',
            isSaving: false,
          };
        }
        return {
          successMessage: 'Financiamiento agregado con éxito',
          isSaving: false,
        };
      });
      return true;
    } catch (err) {
      set({ error: getErrorMessage(err), isSaving: false });
      return false;
    }
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  clearSelectedVenta: () => set({ selectedVenta: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
