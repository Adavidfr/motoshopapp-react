import { create } from 'zustand';
import type {
  PaginatedProveedores,
  Proveedor,
  ProveedorStats,
} from '../../domain/entities/proveedor.entity';

import type {
  ProveedorDto,
  ProveedorFilters,
} from '../../application/dtos/proveedor.dto';

import {
  createProveedorUseCase,
  deleteProveedorUseCase,
  getProveedorStatsUseCase,
  getProveedorUseCase,
  getProveedoresUseCase,
  updateProveedorUseCase,
} from '../../infrastructure/factories/proveedor.factory';

interface ProveedorState {
  proveedores: Proveedor[];
  selectedProveedor: Proveedor | null;
  stats: ProveedorStats | null;

  count: number;
  next: string | null;
  previous: string | null;

  filters: ProveedorFilters;

  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;

  fetchProveedores: (
    filters?: ProveedorFilters,
  ) => Promise<void>;

  fetchProveedorById: (
    id: number,
  ) => Promise<void>;

  fetchStats: () => Promise<void>;

  createProveedor: (
    dto: ProveedorDto,
  ) => Promise<Proveedor>;

  updateProveedor: (
    id: number,
    dto: Partial<ProveedorDto>,
  ) => Promise<Proveedor>;

  deleteProveedor: (
    id: number,
  ) => Promise<void>;

  setFilters: (
    filters: Partial<ProveedorFilters>,
  ) => void;

  clearSelectedProveedor: () => void;
  clearMessages: () => void;
}

function getApiErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (
      error as {
        response?: {
          data?: Record<string, unknown>;
        };
      }
    ).response;

    const data = response?.data;

    if (data) {
      if (typeof data.detail === 'string') {
        return data.detail;
      }

      for (const value of Object.values(data)) {
        if (
          Array.isArray(value) &&
          typeof value[0] === 'string'
        ) {
          return value[0];
        }

        if (typeof value === 'string') {
          return value;
        }
      }
    }
  }

  return 'Ocurrió un error al procesar la solicitud.';
}

export const useProveedorStore = create<ProveedorState>(
  (set, get) => ({
    proveedores: [],
    selectedProveedor: null,
    stats: null,

    count: 0,
    next: null,
    previous: null,

    filters: {
      page: 1,
      pageSize: 10,
      ordering: 'nombre',
    },

    isLoading: false,
    isSaving: false,
    error: null,
    successMessage: null,

    fetchProveedores: async (newFilters) => {
      const currentFilters = {
        ...get().filters,
        ...newFilters,
      };

      set({
        isLoading: true,
        error: null,
        filters: currentFilters,
      });

      try {
        const response: PaginatedProveedores =
          await getProveedoresUseCase.execute(currentFilters);

        set({
          proveedores: response.results,
          count: response.count,
          next: response.next,
          previous: response.previous,
          isLoading: false,
        });
      } catch (error) {
        set({
          isLoading: false,
          error: getApiErrorMessage(error),
        });
      }
    },

    fetchProveedorById: async (id) => {
      set({
        isLoading: true,
        error: null,
        selectedProveedor: null,
      });

      try {
        const proveedor =
          await getProveedorUseCase.execute(id);

        set({
          selectedProveedor: proveedor,
          isLoading: false,
        });
      } catch (error) {
        set({
          isLoading: false,
          error: getApiErrorMessage(error),
        });
      }
    },

    fetchStats: async () => {
      try {
        const stats =
          await getProveedorStatsUseCase.execute();

        set({ stats });
      } catch (error) {
        set({
          error: getApiErrorMessage(error),
        });
      }
    },

    createProveedor: async (dto) => {
      set({
        isSaving: true,
        error: null,
        successMessage: null,
      });

      try {
        const proveedor =
          await createProveedorUseCase.execute(dto);

        set({
          isSaving: false,
          successMessage: 'Proveedor creado correctamente.',
        });

        await get().fetchProveedores();
        await get().fetchStats();

        return proveedor;
      } catch (error) {
        const message = getApiErrorMessage(error);

        set({
          isSaving: false,
          error: message,
        });

        throw error;
      }
    },

    updateProveedor: async (id, dto) => {
      set({
        isSaving: true,
        error: null,
        successMessage: null,
      });

      try {
        const proveedor =
          await updateProveedorUseCase.execute(id, dto);

        set({
          isSaving: false,
          selectedProveedor: proveedor,
          successMessage: 'Proveedor actualizado correctamente.',
        });

        await get().fetchProveedores();
        await get().fetchStats();

        return proveedor;
      } catch (error) {
        const message = getApiErrorMessage(error);

        set({
          isSaving: false,
          error: message,
        });

        throw error;
      }
    },

    deleteProveedor: async (id) => {
      set({
        isSaving: true,
        error: null,
        successMessage: null,
      });

      try {
        await deleteProveedorUseCase.execute(id);

        set({
          isSaving: false,
          successMessage: 'Proveedor eliminado correctamente.',
        });

        await get().fetchProveedores();
        await get().fetchStats();
      } catch (error) {
        const message = getApiErrorMessage(error);

        set({
          isSaving: false,
          error: message,
        });

        throw error;
      }
    },

    setFilters: (filters) => {
      set((state) => ({
        filters: {
          ...state.filters,
          ...filters,
        },
      }));
    },

    clearSelectedProveedor: () => {
      set({ selectedProveedor: null });
    },

    clearMessages: () => {
      set({
        error: null,
        successMessage: null,
      });
    },
  }),
);