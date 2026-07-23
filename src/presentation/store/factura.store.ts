// src/presentation/store/factura.store.ts
import { create } from 'zustand';
import type { Factura, FacturaCreatePayload } from '../../domain/entities/factura.entity';
import type { FacturaFilters } from '../../domain/ports/factura.repository';
import {
  getFacturasUseCase,
  getFacturaUseCase,
  createFacturaUseCase,
} from '../../infrastructure/factories/factura.factory';
import { parseApiError } from '../../infrastructure/http/api-error';

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
  createFactura: (payload: FacturaCreatePayload) => Promise<boolean>;
  ventaTieneFactura: (idVenta: number) => boolean;
  setFilters: (filters: Partial<FacturaFilters>) => void;
  clearSelectedFactura: () => void;
  clearMessages: () => void;
}

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

  ventaTieneFactura: (idVenta) =>
    get().facturas.some((f) => f.id_venta === idVenta),

  fetchFacturas: async (filters) => {
    set({ isLoading: true, error: null });
    const f = { ...get().filters, ...filters };
    try {
      const r = await getFacturasUseCase.execute(f);
      set({
        facturas: r.results,
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

  fetchFacturaById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const factura = await getFacturaUseCase.execute(id);
      set({ selectedFactura: factura, isLoading: false });
    } catch (err) {
      set({ error: parseApiError(err), isLoading: false });
    }
  },

  createFactura: async (payload) => {
    if (get().isSaving) return false;

    if (get().ventaTieneFactura(payload.id_venta)) {
      set({ error: 'Esta venta ya tiene una factura emitida.' });
      return false;
    }

    set({ isSaving: true, error: null, successMessage: null });
    try {
      const factura = await createFacturaUseCase.execute(payload);
      set((state) => ({
        facturas: [factura, ...state.facturas.filter((f) => f.id_factura !== factura.id_factura)],
        count: state.count + (state.facturas.some((f) => f.id_factura === factura.id_factura) ? 0 : 1),
        selectedFactura: factura,
        successMessage: `Factura ${factura.numero_factura} emitida con éxito`,
        isSaving: false,
      }));
      return true;
    } catch (err) {
      set({ error: parseApiError(err), isSaving: false });
      return false;
    }
  },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  clearSelectedFactura: () => set({ selectedFactura: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
