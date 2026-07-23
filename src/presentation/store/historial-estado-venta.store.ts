// src/presentation/store/historial-estado-venta.store.ts
import { create } from 'zustand';
import type { HistorialEstadoVenta } from '../../domain/entities/historial-estado-venta.entity';
import type { HistorialFilters } from '../../domain/ports/historial-estado-venta.repository';
import {
  getHistorialesUseCase,
  getHistorialUseCase,
} from '../../infrastructure/factories/historial-estado-venta.factory';
import { parseApiError } from '../../infrastructure/http/api-error';

interface HistorialState {
  historiales: HistorialEstadoVenta[];
  selectedHistorial: HistorialEstadoVenta | null;
  count: number;
  next: string | null;
  previous: string | null;
  filters: HistorialFilters;
  isLoading: boolean;
  error: string | null;

  fetchHistoriales: (filters?: HistorialFilters) => Promise<void>;
  fetchHistorialById: (id: number) => Promise<void>;
  setFilters: (filters: Partial<HistorialFilters>) => void;
  clearSelectedHistorial: () => void;
  clearMessages: () => void;
}

export const useHistorialEstadoVentaStore = create<HistorialState>((set, get) => ({
  historiales: [],
  selectedHistorial: null,
  count: 0,
  next: null,
  previous: null,
  filters: { page: 1, pageSize: 10 },
  isLoading: false,
  error: null,

  fetchHistoriales: async (filters) => {
    set({ isLoading: true, error: null });
    const f = { ...get().filters, ...filters };
    try {
      const r = await getHistorialesUseCase.execute(f);
      set({ historiales: r.results, count: r.count, next: r.next, previous: r.previous, filters: f, isLoading: false });
    } catch (err) { set({ error: parseApiError(err), isLoading: false }); }
  },

  fetchHistorialById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const h = await getHistorialUseCase.execute(id);
      set({ selectedHistorial: h, isLoading: false });
    } catch (err) { set({ error: parseApiError(err), isLoading: false }); }
  },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  clearSelectedHistorial: () => set({ selectedHistorial: null }),
  clearMessages: () => set({ error: null }),
}));
