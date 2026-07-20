// src/presentation/store/devolucion.store.ts
import { create } from 'zustand';
import type { Devolucion, DevolucionStats } from '../../domain/entities/devolucion.entity';
import type { DevolucionFilters } from '../../domain/ports/devolucion.repository';
import {
  getDevolucionesUseCase,
  getDevolucionUseCase,
  createDevolucionUseCase,
  updateDevolucionUseCase,
  deleteDevolucionUseCase,
  getDevolucionStatsUseCase,
} from '../../infrastructure/factories/devolucion.factory';

interface DevolucionState {
  devoluciones: Devolucion[];
  selectedDevolucion: Devolucion | null;
  count: number;
  next: string | null;
  previous: string | null;
  filters: DevolucionFilters;
  stats: DevolucionStats | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;

  fetchDevoluciones: (filters?: DevolucionFilters) => Promise<void>;
  fetchDevolucionById: (id: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  createDevolucion: (payload: Omit<Devolucion, 'id_devolucion' | 'fecha_solicitud' | 'fecha_resolucion'>) => Promise<boolean>;
  updateDevolucion: (id: number, payload: Partial<Devolucion>) => Promise<boolean>;
  deleteDevolucion: (id: number) => Promise<boolean>;
  setFilters: (filters: Partial<DevolucionFilters>) => void;
  clearSelectedDevolucion: () => void;
  clearMessages: () => void;
}

const getErr = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const e = error as any;
    const d = e.response?.data;
    if (typeof d === 'string') return d;
    if (d && typeof d === 'object') {
      if (d.error) return String(d.error);
      if (d.detail) return String(d.detail);
      const k = Object.keys(d);
      if (k.length > 0) { const v = d[k[0]]; return Array.isArray(v) ? String(v[0]) : String(v); }
    }
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado';
};

export const useDevolucionStore = create<DevolucionState>((set, get) => ({
  devoluciones: [],
  selectedDevolucion: null,
  count: 0,
  next: null,
  previous: null,
  filters: { page: 1, pageSize: 10 },
  stats: null,
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,

  fetchDevoluciones: async (filters) => {
    set({ isLoading: true, error: null });
    const f = { ...get().filters, ...filters };
    try {
      const r = await getDevolucionesUseCase.execute(f);
      set({ devoluciones: r.results, count: r.count, next: r.next, previous: r.previous, filters: f, isLoading: false });
    } catch (err) { set({ error: getErr(err), isLoading: false }); }
  },

  fetchDevolucionById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const d = await getDevolucionUseCase.execute(id);
      set({ selectedDevolucion: d, isLoading: false });
    } catch (err) { set({ error: getErr(err), isLoading: false }); }
  },

  fetchStats: async () => {
    try {
      const s = await getDevolucionStatsUseCase.execute();
      set({ stats: s });
    } catch (err) { console.error('Error fetching stats:', err); }
  },

  createDevolucion: async (payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await createDevolucionUseCase.execute(payload);
      set({ successMessage: 'Devolución registrada con éxito', isSaving: false });
      get().fetchDevoluciones();
      get().fetchStats();
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  updateDevolucion: async (id, payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const updated = await updateDevolucionUseCase.execute(id, payload);
      set((s) => ({
        devoluciones: s.devoluciones.map((d) => (d.id_devolucion === id ? updated : d)),
        selectedDevolucion: s.selectedDevolucion?.id_devolucion === id ? updated : s.selectedDevolucion,
        successMessage: 'Devolución actualizada con éxito',
        isSaving: false,
      }));
      get().fetchStats();
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  deleteDevolucion: async (id) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await deleteDevolucionUseCase.execute(id);
      set((s) => ({
        devoluciones: s.devoluciones.filter((d) => d.id_devolucion !== id),
        selectedDevolucion: s.selectedDevolucion?.id_devolucion === id ? null : s.selectedDevolucion,
        successMessage: 'Devolución eliminada con éxito',
        isSaving: false,
      }));
      get().fetchStats();
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  clearSelectedDevolucion: () => set({ selectedDevolucion: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
