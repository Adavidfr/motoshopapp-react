// src/presentation/store/devolucion.store.ts
import { create } from 'zustand';
import type { Devolucion, DevolucionStats, DevolucionCreatePayload } from '../../domain/entities/devolucion.entity';
import type { DevolucionFilters } from '../../domain/ports/devolucion.repository';
import {
  getDevolucionesUseCase,
  getDevolucionUseCase,
  createDevolucionUseCase,
  getDevolucionStatsUseCase,
  aprobarDevolucionUseCase,
  rechazarDevolucionUseCase,
} from '../../infrastructure/factories/devolucion.factory';
import { parseApiError } from '../../infrastructure/http/api-error';

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
  createDevolucion: (payload: DevolucionCreatePayload) => Promise<boolean>;
  aprobarDevolucion: (id: number) => Promise<boolean>;
  rechazarDevolucion: (id: number) => Promise<boolean>;
  ventaTieneDevolucionAbierta: (idVenta: number) => boolean;
  setFilters: (filters: Partial<DevolucionFilters>) => void;
  clearSelectedDevolucion: () => void;
  clearMessages: () => void;
}

const ESTADOS_ABIERTOS = new Set(['solicitada', 'aprobada']);

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

  ventaTieneDevolucionAbierta: (idVenta) =>
    get().devoluciones.some(
      (d) => d.id_venta === idVenta && ESTADOS_ABIERTOS.has(d.estado),
    ),

  fetchDevoluciones: async (filters) => {
    set({ isLoading: true, error: null });
    const f = { ...get().filters, ...filters };
    try {
      const r = await getDevolucionesUseCase.execute(f);
      set({
        devoluciones: r.results,
        count: r.count,
        next: r.next,
        previous: r.previous,
        filters: f,
        isLoading: false,
      });
    } catch (err) {
      set({ error: parseApiError(err), isLoading: false });
    }
  },

  fetchDevolucionById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const d = await getDevolucionUseCase.execute(id);
      set({ selectedDevolucion: d, isLoading: false });
    } catch (err) {
      set({ error: parseApiError(err), isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const s = await getDevolucionStatsUseCase.execute();
      set({ stats: s });
    } catch (err) {
      console.error('Error fetching devolucion stats:', err);
    }
  },

  createDevolucion: async (payload) => {
    if (get().isSaving) return false;

    if (get().ventaTieneDevolucionAbierta(payload.id_venta)) {
      set({ error: 'Ya existe una devolución pendiente para esta venta.' });
      return false;
    }

    set({ isSaving: true, error: null, successMessage: null });
    try {
      const devolucion = await createDevolucionUseCase.execute(payload);
      set((state) => ({
        devoluciones: [devolucion, ...state.devoluciones.filter((d) => d.id_devolucion !== devolucion.id_devolucion)],
        count: state.count + (state.devoluciones.some((d) => d.id_devolucion === devolucion.id_devolucion) ? 0 : 1),
        selectedDevolucion: devolucion,
        successMessage: 'Solicitud de devolución registrada',
        isSaving: false,
      }));
      get().fetchStats();
      return true;
    } catch (err) {
      set({ error: parseApiError(err), isSaving: false });
      return false;
    }
  },

  aprobarDevolucion: async (id) => {
    if (get().isSaving) return false;

    const current = get().devoluciones.find((d) => d.id_devolucion === id);
    if (current && current.estado !== 'solicitada') {
      set({ error: 'Solo se pueden aprobar devoluciones en estado solicitada.' });
      return false;
    }

    set({ isSaving: true, error: null, successMessage: null });
    try {
      const updated = await aprobarDevolucionUseCase.execute(id);
      set((s) => ({
        devoluciones: s.devoluciones.map((d) => (d.id_devolucion === id ? updated : d)),
        selectedDevolucion: s.selectedDevolucion?.id_devolucion === id ? updated : s.selectedDevolucion,
        successMessage: 'Devolución aprobada — stock reintegrado y reembolso aplicado si corresponde',
        isSaving: false,
      }));
      get().fetchStats();
      return true;
    } catch (err) {
      set({ error: parseApiError(err), isSaving: false });
      return false;
    }
  },

  rechazarDevolucion: async (id) => {
    if (get().isSaving) return false;

    const current = get().devoluciones.find((d) => d.id_devolucion === id);
    if (current && current.estado !== 'solicitada') {
      set({ error: 'Solo se pueden rechazar devoluciones en estado solicitada.' });
      return false;
    }

    set({ isSaving: true, error: null, successMessage: null });
    try {
      const updated = await rechazarDevolucionUseCase.execute(id);
      set((s) => ({
        devoluciones: s.devoluciones.map((d) => (d.id_devolucion === id ? updated : d)),
        selectedDevolucion: s.selectedDevolucion?.id_devolucion === id ? updated : s.selectedDevolucion,
        successMessage: 'Devolución rechazada',
        isSaving: false,
      }));
      get().fetchStats();
      return true;
    } catch (err) {
      set({ error: parseApiError(err), isSaving: false });
      return false;
    }
  },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  clearSelectedDevolucion: () => set({ selectedDevolucion: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
