import { create } from 'zustand';

import type {
  Compra,
  CompraStats,
} from '../../domain/entities/compra.entity';

import type {
  CompraDto,
  CompraFilters,
} from '../../application/dtos/compra.dto';

import {
  createCompraUseCase,
  deleteCompraUseCase,
  getCompraStatsUseCase,
  getCompraUseCase,
  getComprasUseCase,
  updateCompraUseCase,
} from '../../infrastructure/factories/compra.factory';

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

  fetchCompras: (
    filters?: CompraFilters,
  ) => Promise<void>;

  fetchCompraById: (
    id: number,
  ) => Promise<void>;

  fetchStats: () => Promise<void>;

  createCompra: (
    dto: CompraDto,
  ) => Promise<boolean>;

  updateCompra: (
    id: number,
    dto: Partial<CompraDto>,
  ) => Promise<boolean>;

  deleteCompra: (
    id: number,
  ) => Promise<boolean>;

  setFilters: (
    filters: Partial<CompraFilters>,
  ) => void;

  clearSelectedCompra: () => void;
  clearMessages: () => void;
}

const getErrorMessage = (error: unknown): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const axiosError = error as {
      response?: {
        data?:
          | Record<string, unknown>
          | string;
      };
    };

    const data = axiosError.response?.data;

    if (typeof data === 'string') {
      return data;
    }

    if (data && typeof data === 'object') {
      const nonFieldErrors =
        data.non_field_errors;

      if (Array.isArray(nonFieldErrors)) {
        return String(nonFieldErrors[0]);
      }

      if (typeof nonFieldErrors === 'string') {
        return nonFieldErrors;
      }

      const detail = data.detail;

      if (typeof detail === 'string') {
        return detail;
      }

      const firstValue =
        Object.values(data)[0];

      if (Array.isArray(firstValue)) {
        return String(firstValue[0]);
      }

      if (typeof firstValue === 'string') {
        return firstValue;
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado.';
};

export const useCompraStore =
  create<CompraState>((set, get) => ({
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
      const filters = {
        ...get().filters,
        ...newFilters,
      };

      set({
        isLoading: true,
        error: null,
        filters,
      });

      try {
        const response =
          await getComprasUseCase.execute(filters);

        set({
          compras: response.results,
          count: response.count,
          next: response.next,
          previous: response.previous,
          isLoading: false,
        });
      } catch (error) {
        set({
          isLoading: false,
          error: getErrorMessage(error),
        });
      }
    },

    fetchCompraById: async (id) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const compra =
          await getCompraUseCase.execute(id);

        set({
          selectedCompra: compra,
          isLoading: false,
        });
      } catch (error) {
        set({
          isLoading: false,
          error: getErrorMessage(error),
        });
      }
    },

    fetchStats: async () => {
      try {
        const stats =
          await getCompraStatsUseCase.execute();

        set({ stats });
      } catch (error) {
        set({
          error: getErrorMessage(error),
        });
      }
    },

    createCompra: async (dto) => {
      set({
        isSaving: true,
        error: null,
        successMessage: null,
      });

      try {
        await createCompraUseCase.execute(dto);

        set({
          isSaving: false,
          successMessage:
            'Compra registrada correctamente.',
        });

        await Promise.all([
          get().fetchCompras(),
          get().fetchStats(),
        ]);

        return true;
      } catch (error) {
        set({
          isSaving: false,
          error: getErrorMessage(error),
        });

        return false;
      }
    },

    updateCompra: async (id, dto) => {
      set({
        isSaving: true,
        error: null,
        successMessage: null,
      });

      try {
        const updatedCompra =
          await updateCompraUseCase.execute(
            id,
            dto,
          );

        set((state) => ({
          compras: state.compras.map(
            (compra) =>
              compra.id_compra === id
                ? updatedCompra
                : compra,
          ),
          selectedCompra:
            state.selectedCompra?.id_compra === id
              ? updatedCompra
              : state.selectedCompra,
          isSaving: false,
          successMessage:
            'Compra actualizada correctamente.',
        }));

        await Promise.all([
          get().fetchCompras(),
          get().fetchStats(),
        ]);

        return true;
      } catch (error) {
        set({
          isSaving: false,
          error: getErrorMessage(error),
        });

        return false;
      }
    },

    deleteCompra: async (id) => {
      set({
        isSaving: true,
        error: null,
        successMessage: null,
      });

      try {
        await deleteCompraUseCase.execute(id);

        set({
          isSaving: false,
          successMessage:
            'Compra eliminada correctamente.',
        });

        await Promise.all([
          get().fetchCompras(),
          get().fetchStats(),
        ]);

        return true;
      } catch (error) {
        set({
          isSaving: false,
          error: getErrorMessage(error),
        });

        return false;
      }
    },

    setFilters: (newFilters) => {
      set((state) => ({
        filters: {
          ...state.filters,
          ...newFilters,
        },
      }));
    },

    clearSelectedCompra: () => {
      set({
        selectedCompra: null,
      });
    },

    clearMessages: () => {
      set({
        error: null,
        successMessage: null,
      });
    },
  }));