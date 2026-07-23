import { create } from 'zustand';

import type { Compra, CompraStats } from '../../domain/entities/compra.entity';
import type { CompraDto, CompraFilters } from '../../application/dtos/compra.dto';
import {
  createCompraUseCase,
  deleteCompraUseCase,
  getCompraStatsUseCase,
  getCompraUseCase,
  getComprasUseCase,
  updateCompraUseCase,
  recibirCompraUseCase,
} from '../../infrastructure/factories/compra.factory';
import { parseApiError } from '../../infrastructure/http/api-error';

interface CompraState {
  compras: Compra[];
  selectedCompra: Compra | null;
  stats: CompraStats | null;
  count: number;
  next: string | null;
  previous: string | null;
  filters: CompraFilters;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;

  fetchCompras: (filters?: CompraFilters) => Promise<void>;
  fetchCompraById: (id: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  createCompra: (dto: CompraDto) => Promise<boolean>;
  updateCompra: (id: number, dto: Partial<CompraDto>) => Promise<boolean>;
  recibirCompra: (id: number) => Promise<boolean>;
  deleteCompra: (id: number) => Promise<boolean>;
  setFilters: (filters: Partial<CompraFilters>) => void;
  clearSelectedCompra: () => void;
  clearMessages: () => void;
}

export const useCompraStore = create<CompraState>((set, get) => ({
  compras: [],
  selectedCompra: null,
  stats: null,
  count: 0,
  next: null,
  previous: null,
  filters: {
    page: 1,
    pageSize: 10,
    ordering: '-fecha_compra',
  },
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,

  fetchCompras: async (newFilters = {}) => {
    const filters = { ...get().filters, ...newFilters };
    set({ isLoading: true, error: null, filters });

    try {
      const response = await getComprasUseCase.execute(filters);
      set({
        compras: response.results,
        count: response.count,
        next: response.next,
        previous: response.previous,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: parseApiError(error) });
    }
  },

  fetchCompraById: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const compra = await getCompraUseCase.execute(id);
      set({ selectedCompra: compra, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: parseApiError(error) });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await getCompraStatsUseCase.execute();
      set({ stats });
    } catch (error) {
      console.error('Error fetching compra stats:', error);
    }
  },

  createCompra: async (dto) => {
    if (get().isSaving) return false;

    set({ isSaving: true, error: null, successMessage: null });

    try {
      const created = await createCompraUseCase.execute(dto);
      set((state) => ({
        compras: [created, ...state.compras.filter((c) => c.id_compra !== created.id_compra)],
        count: state.count + (state.compras.some((c) => c.id_compra === created.id_compra) ? 0 : 1),
        isSaving: false,
        successMessage: 'Compra registrada correctamente.',
      }));
      get().fetchStats();
      return true;
    } catch (error) {
      set({ isSaving: false, error: parseApiError(error) });
      return false;
    }
  },

  updateCompra: async (id, dto) => {
    if (get().isSaving) return false;

    set({ isSaving: true, error: null, successMessage: null });

    try {
      const updated = await updateCompraUseCase.execute(id, dto);
      set((state) => ({
        compras: state.compras.map((c) => (c.id_compra === id ? updated : c)),
        selectedCompra: state.selectedCompra?.id_compra === id ? updated : state.selectedCompra,
        isSaving: false,
        successMessage: 'Compra actualizada correctamente.',
      }));
      get().fetchStats();
      return true;
    } catch (error) {
      set({ isSaving: false, error: parseApiError(error) });
      return false;
    }
  },

  recibirCompra: async (id) => {
    if (get().isSaving) return false;

    const current = get().compras.find((c) => c.id_compra === id);
    if (current && current.estado !== 'Pendiente') {
      set({ error: 'Solo se pueden recibir compras en estado Pendiente.' });
      return false;
    }

    set({ isSaving: true, error: null, successMessage: null });

    try {
      const updated = await recibirCompraUseCase.execute(id);
      set((state) => ({
        compras: state.compras.map((c) => (c.id_compra === id ? updated : c)),
        selectedCompra: state.selectedCompra?.id_compra === id ? updated : state.selectedCompra,
        isSaving: false,
        successMessage: 'Compra recibida e inventario actualizado.',
      }));
      get().fetchStats();
      return true;
    } catch (error) {
      set({ isSaving: false, error: parseApiError(error) });
      return false;
    }
  },

  deleteCompra: async (id) => {
    if (get().isSaving) return false;

    set({ isSaving: true, error: null, successMessage: null });

    try {
      await deleteCompraUseCase.execute(id);
      set((state) => ({
        compras: state.compras.filter((c) => c.id_compra !== id),
        count: Math.max(0, state.count - 1),
        selectedCompra: state.selectedCompra?.id_compra === id ? null : state.selectedCompra,
        isSaving: false,
        successMessage: 'Compra eliminada correctamente.',
      }));
      get().fetchStats();
      return true;
    } catch (error) {
      set({ isSaving: false, error: parseApiError(error) });
      return false;
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearSelectedCompra: () => set({ selectedCompra: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
