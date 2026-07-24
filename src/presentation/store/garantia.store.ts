// src/presentation/store/garantia.store.ts
import { create } from 'zustand';
import type { Garantia, GarantiaEstado } from '../../domain/entities/garantia.entity';
import type { GarantiaFilters } from '../../domain/ports/garantia.repository';
import {
  getGarantiasUseCase,
  getGarantiaUseCase,
  createGarantiaUseCase,
  updateGarantiaUseCase,
  deleteGarantiaUseCase,
} from '../../infrastructure/factories/garantia.factory';

interface GarantiaState {
  garantias: Garantia[];
  selectedGarantia: Garantia | null;
  count: number;
  next: string | null;
  previous: string | null;
  filters: GarantiaFilters;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;

  fetchGarantias: (filters?: GarantiaFilters) => Promise<void>;
  fetchGarantiaById: (id: number) => Promise<void>;
  createGarantia: (payload: Omit<Garantia, 'id_garantia'>) => Promise<boolean>;
  updateGarantiaStatus: (id: number, estado: GarantiaEstado) => Promise<boolean>;
  updateGarantia: (id: number, payload: Partial<Garantia>) => Promise<boolean>;
  deleteGarantia: (id: number) => Promise<boolean>;
  setFilters: (filters: Partial<GarantiaFilters>) => void;
  clearSelectedGarantia: () => void;
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

export const useGarantiaStore = create<GarantiaState>((set, get) => ({
  garantias: [],
  selectedGarantia: null,
  count: 0,
  next: null,
  previous: null,
  filters: { page: 1, pageSize: 10 },
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,

  fetchGarantias: async (filters) => {
    set({ isLoading: true, error: null });
    const f = { ...get().filters, ...filters };
    try {
      const r = await getGarantiasUseCase.execute(f);
      set({ garantias: r.results, count: r.count, next: r.next, previous: r.previous, filters: f, isLoading: false });
    } catch (err) { set({ error: getErr(err), isLoading: false }); }
  },

  fetchGarantiaById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const g = await getGarantiaUseCase.execute(id);
      set({ selectedGarantia: g, isLoading: false });
    } catch (err) { set({ error: getErr(err), isLoading: false }); }
  },

  createGarantia: async (payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await createGarantiaUseCase.execute(payload);
      set({ successMessage: 'Garantía registrada con éxito', isSaving: false });
      get().fetchGarantias();
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  updateGarantiaStatus: async (id, estado) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const updated = await updateGarantiaUseCase.execute(id, { estado });
      const label = estado === 'vencida' ? 'vencida' : estado === 'anulada' ? 'anulada' : estado;
      set((s) => ({
        garantias: s.garantias.map((g) => (g.id_garantia === id ? updated : g)),
        selectedGarantia: s.selectedGarantia?.id_garantia === id ? updated : s.selectedGarantia,
        successMessage: `Garantía marcada como ${label}`,
        isSaving: false,
      }));
      return true;
    } catch (err) {
      // Conserva el mensaje 400 del backend (p. ej. transición inválida).
      set({ error: getErr(err), successMessage: null, isSaving: false });
      return false;
    }
  },

  updateGarantia: async (id, payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const updated = await updateGarantiaUseCase.execute(id, payload);
      set((s) => ({
        garantias: s.garantias.map((g) => (g.id_garantia === id ? updated : g)),
        selectedGarantia: s.selectedGarantia?.id_garantia === id ? updated : s.selectedGarantia,
        successMessage: 'Garantía actualizada con éxito',
        isSaving: false,
      }));
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  deleteGarantia: async (id) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await deleteGarantiaUseCase.execute(id);
      set((s) => ({
        garantias: s.garantias.filter((g) => g.id_garantia !== id),
        selectedGarantia: s.selectedGarantia?.id_garantia === id ? null : s.selectedGarantia,
        successMessage: 'Garantía eliminada con éxito',
        isSaving: false,
      }));
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  clearSelectedGarantia: () => set({ selectedGarantia: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
