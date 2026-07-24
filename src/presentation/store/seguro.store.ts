// src/presentation/store/seguro.store.ts
import { create } from 'zustand';
import type {
  Seguro,
  SeguroEstado,
  SeguroCreatePayload,
  SeguroUpdatePayload,
} from '../../domain/entities/seguro.entity';
import type { SeguroFilters } from '../../domain/ports/seguro.repository';
import {
  getSegurosUseCase,
  getSeguroUseCase,
  createSeguroUseCase,
  updateSeguroUseCase,
  deleteSeguroUseCase,
} from '../../infrastructure/factories/seguro.factory';
import { parseApiError } from '../../infrastructure/http/api-error';

interface SeguroState {
  seguros: Seguro[];
  selectedSeguro: Seguro | null;
  count: number;
  next: string | null;
  previous: string | null;
  filters: SeguroFilters;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;

  fetchSeguros: (filters?: SeguroFilters) => Promise<void>;
  fetchSeguroById: (id: number) => Promise<void>;
  createSeguro: (payload: SeguroCreatePayload) => Promise<boolean>;
  updateSeguroStatus: (id: number, estado: SeguroEstado) => Promise<boolean>;
  updateSeguro: (id: number, payload: SeguroUpdatePayload) => Promise<boolean>;
  deleteSeguro: (id: number) => Promise<boolean>;
  setFilters: (filters: Partial<SeguroFilters>) => void;
  clearSelectedSeguro: () => void;
  clearMessages: () => void;
}

export const useSeguroStore = create<SeguroState>((set, get) => ({
  seguros: [],
  selectedSeguro: null,
  count: 0,
  next: null,
  previous: null,
  filters: { page: 1, pageSize: 10 },
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,

  fetchSeguros: async (filters) => {
    set({ isLoading: true, error: null });
    const f = { ...get().filters, ...filters };
    try {
      const r = await getSegurosUseCase.execute(f);
      set({
        seguros: r.results,
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

  fetchSeguroById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const s = await getSeguroUseCase.execute(id);
      set({ selectedSeguro: s, isLoading: false });
    } catch (err) {
      set({ error: parseApiError(err), isLoading: false });
    }
  },

  createSeguro: async (payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const created = await createSeguroUseCase.execute(payload);
      set({
        successMessage: `Seguro registrado correctamente.\nPóliza: ${created.numero_poliza}`,
        isSaving: false,
      });
      void get().fetchSeguros();
      return true;
    } catch (err) {
      set({ error: parseApiError(err), isSaving: false });
      return false;
    }
  },

  updateSeguroStatus: async (id, estado) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const updated = await updateSeguroUseCase.execute(id, { estado });
      set((s) => ({
        seguros: s.seguros.map((sg) => (sg.id_seguro === id ? updated : sg)),
        selectedSeguro: s.selectedSeguro?.id_seguro === id ? updated : s.selectedSeguro,
        successMessage: 'Estado de seguro actualizado',
        isSaving: false,
      }));
      return true;
    } catch (err) {
      set({ error: parseApiError(err), isSaving: false });
      return false;
    }
  },

  updateSeguro: async (id, payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const updated = await updateSeguroUseCase.execute(id, payload);
      set((s) => ({
        seguros: s.seguros.map((sg) => (sg.id_seguro === id ? updated : sg)),
        selectedSeguro: s.selectedSeguro?.id_seguro === id ? updated : s.selectedSeguro,
        successMessage: 'Seguro actualizado con éxito',
        isSaving: false,
      }));
      return true;
    } catch (err) {
      set({ error: parseApiError(err), isSaving: false });
      return false;
    }
  },

  deleteSeguro: async (id) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await deleteSeguroUseCase.execute(id);
      set((s) => ({
        seguros: s.seguros.filter((sg) => sg.id_seguro !== id),
        selectedSeguro: s.selectedSeguro?.id_seguro === id ? null : s.selectedSeguro,
        successMessage: 'Seguro eliminado con éxito',
        isSaving: false,
      }));
      return true;
    } catch (err) {
      set({ error: parseApiError(err), isSaving: false });
      return false;
    }
  },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  clearSelectedSeguro: () => set({ selectedSeguro: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
