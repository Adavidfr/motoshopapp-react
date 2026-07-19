// src/presentation/store/historial-estado-venta.store.ts
import { create } from 'zustand';
import type { HistorialEstadoVenta } from '../../domain/entities/historial-estado-venta.entity';
import type { HistorialFilters } from '../../domain/ports/historial-estado-venta.repository';
import {
  getHistorialesUseCase,
  getHistorialUseCase,
  createHistorialUseCase,
  updateHistorialUseCase,
  deleteHistorialUseCase,
} from '../../infrastructure/factories/historial-estado-venta.factory';

interface HistorialState {
  historiales: HistorialEstadoVenta[];
  selectedHistorial: HistorialEstadoVenta | null;
  count: number;
  next: string | null;
  previous: string | null;
  filters: HistorialFilters;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;

  fetchHistoriales: (filters?: HistorialFilters) => Promise<void>;
  fetchHistorialById: (id: number) => Promise<void>;
  createHistorial: (payload: Omit<HistorialEstadoVenta, 'id_historial' | 'fecha_cambio'>) => Promise<boolean>;
  updateHistorial: (id: number, payload: Partial<HistorialEstadoVenta>) => Promise<boolean>;
  deleteHistorial: (id: number) => Promise<boolean>;
  setFilters: (filters: Partial<HistorialFilters>) => void;
  clearSelectedHistorial: () => void;
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

export const useHistorialEstadoVentaStore = create<HistorialState>((set, get) => ({
  historiales: [],
  selectedHistorial: null,
  count: 0,
  next: null,
  previous: null,
  filters: { page: 1, pageSize: 10 },
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,

  fetchHistoriales: async (filters) => {
    set({ isLoading: true, error: null });
    const f = { ...get().filters, ...filters };
    try {
      const r = await getHistorialesUseCase.execute(f);
      set({ historiales: r.results, count: r.count, next: r.next, previous: r.previous, filters: f, isLoading: false });
    } catch (err) { set({ error: getErr(err), isLoading: false }); }
  },

  fetchHistorialById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const h = await getHistorialUseCase.execute(id);
      set({ selectedHistorial: h, isLoading: false });
    } catch (err) { set({ error: getErr(err), isLoading: false }); }
  },

  createHistorial: async (payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await createHistorialUseCase.execute(payload);
      set({ successMessage: 'Historial registrado con éxito', isSaving: false });
      get().fetchHistoriales();
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  updateHistorial: async (id, payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const updated = await updateHistorialUseCase.execute(id, payload);
      set((s) => ({
        historiales: s.historiales.map((h) => (h.id_historial === id ? updated : h)),
        selectedHistorial: s.selectedHistorial?.id_historial === id ? updated : s.selectedHistorial,
        successMessage: 'Historial actualizado con éxito',
        isSaving: false,
      }));
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  deleteHistorial: async (id) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await deleteHistorialUseCase.execute(id);
      set((s) => ({
        historiales: s.historiales.filter((h) => h.id_historial !== id),
        selectedHistorial: s.selectedHistorial?.id_historial === id ? null : s.selectedHistorial,
        successMessage: 'Historial eliminado con éxito',
        isSaving: false,
      }));
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  clearSelectedHistorial: () => set({ selectedHistorial: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
