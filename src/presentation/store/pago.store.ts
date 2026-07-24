// src/presentation/store/pago.store.ts
import { create } from 'zustand';
import type { Pago, PagoStats, PagoCreatePayload, PagoFacturaResumen } from '../../domain/entities/pago.entity';
import type { PagoFilters } from '../../domain/ports/pago.repository';
import {
  createPagoUseCase,
  getPagosUseCase,
  getPagoUseCase,
  getPagoStatsUseCase,
} from '../../infrastructure/factories/pago.factory';
import { parseApiError } from '../../infrastructure/http/api-error';

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
  createPago: (payload: PagoCreatePayload) => Promise<boolean>;
  patchPagoFactura: (idPago: number, factura: PagoFacturaResumen) => void;
  setFilters: (filters: Partial<PagoFilters>) => void;
  clearSelectedPago: () => void;
  clearMessages: () => void;
}

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
      set({ error: parseApiError(err), isLoading: false });
    }
  },

  fetchPagoById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const pago = await getPagoUseCase.execute(id);
      set({ selectedPago: pago, isLoading: false });
    } catch (err) {
      set({ error: parseApiError(err), isLoading: false });
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
    if (get().isSaving) return false;

    set({ isSaving: true, error: null, successMessage: null });
    try {
      const pago = await createPagoUseCase.execute(payload);
      set((state) => ({
        pagos: [pago, ...state.pagos.filter((p) => p.id_pago !== pago.id_pago)],
        count: state.count + (state.pagos.some((p) => p.id_pago === pago.id_pago) ? 0 : 1),
        selectedPago: pago,
        successMessage: 'Pago registrado con éxito',
        isSaving: false,
      }));
      get().fetchStats();
      return true;
    } catch (err) {
      set({ error: parseApiError(err), isSaving: false });
      return false;
    }
  },

  patchPagoFactura: (idPago, factura) => {
    set((state) => ({
      pagos: state.pagos.map((p) =>
        p.id_pago === idPago ? { ...p, factura } : p,
      ),
      selectedPago: state.selectedPago?.id_pago === idPago
        ? { ...state.selectedPago, factura }
        : state.selectedPago,
    }));
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  clearSelectedPago: () => set({ selectedPago: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
