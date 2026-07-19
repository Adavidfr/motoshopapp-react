// src/presentation/store/factura.store.ts
import { create } from 'zustand';
import type { Factura } from '../../domain/entities/factura.entity';
import type { FacturaFilters } from '../../domain/ports/factura.repository';
import {
  getFacturasUseCase,
  getFacturaUseCase,
  createFacturaUseCase,
  updateFacturaUseCase,
  deleteFacturaUseCase,
} from '../../infrastructure/factories/factura.factory';

interface FacturaState {
  facturas: Factura[];
  selectedFactura: Factura | null;
  count: number;
  next: string | null;
  previous: string | null;
  filters: FacturaFilters;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;

  fetchFacturas: (filters?: FacturaFilters) => Promise<void>;
  fetchFacturaById: (id: number) => Promise<void>;
  createFactura: (payload: Omit<Factura, 'id_factura' | 'fecha_emision'>) => Promise<boolean>;
  updateFactura: (id: number, payload: Partial<Factura>) => Promise<boolean>;
  deleteFactura: (id: number) => Promise<boolean>;
  setFilters: (filters: Partial<FacturaFilters>) => void;
  clearSelectedFactura: () => void;
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

export const useFacturaStore = create<FacturaState>((set, get) => ({
  facturas: [],
  selectedFactura: null,
  count: 0,
  next: null,
  previous: null,
  filters: { page: 1, pageSize: 10 },
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,

  fetchFacturas: async (filters) => {
    set({ isLoading: true, error: null });
    const f = { ...get().filters, ...filters };
    try {
      const r = await getFacturasUseCase.execute(f);
      set({ facturas: r.results, count: r.count, next: r.next, previous: r.previous, filters: f, isLoading: false });
    } catch (err) { set({ error: getErr(err), isLoading: false }); }
  },

  fetchFacturaById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const f = await getFacturaUseCase.execute(id);
      set({ selectedFactura: f, isLoading: false });
    } catch (err) { set({ error: getErr(err), isLoading: false }); }
  },

  createFactura: async (payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await createFacturaUseCase.execute(payload);
      set({ successMessage: 'Factura registrada con éxito', isSaving: false });
      get().fetchFacturas();
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  updateFactura: async (id, payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const updated = await updateFacturaUseCase.execute(id, payload);
      set((s) => ({
        facturas: s.facturas.map((f) => (f.id_factura === id ? updated : f)),
        selectedFactura: s.selectedFactura?.id_factura === id ? updated : s.selectedFactura,
        successMessage: 'Factura actualizada con éxito',
        isSaving: false,
      }));
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  deleteFactura: async (id) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await deleteFacturaUseCase.execute(id);
      set((s) => ({
        facturas: s.facturas.filter((f) => f.id_factura !== id),
        selectedFactura: s.selectedFactura?.id_factura === id ? null : s.selectedFactura,
        successMessage: 'Factura eliminada con éxito',
        isSaving: false,
      }));
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  clearSelectedFactura: () => set({ selectedFactura: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
