import { create } from 'zustand';

import type {
  Servicio,
  ServicioStats,
} from '../../domain/entities/servicio.entity';

import type {
  ServicioDto,
  ServicioFilters,
} from '../../application/dtos/servicio.dto';

import {
  createServicioUseCase,
  deleteServicioUseCase,
  getServicioStatsUseCase,
  getServicioUseCase,
  getServiciosUseCase,
  updateServicioUseCase,
} from '../../infrastructure/factories/servicio.factory';

interface ServicioState {
  servicios: Servicio[];
  selectedServicio: Servicio | null;
  stats: ServicioStats | null;

  count: number;
  next: string | null;
  previous: string | null;

  filters: ServicioFilters;

  isLoading: boolean;
  isSaving: boolean;

  error: string | null;
  successMessage: string | null;

  fetchServicios: (
    filters?: ServicioFilters,
  ) => Promise<void>;

  fetchServicioById: (
    id: number,
  ) => Promise<void>;

  fetchStats: () => Promise<void>;

  createServicio: (
    dto: ServicioDto,
  ) => Promise<boolean>;

  updateServicio: (
    id: number,
    dto: Partial<ServicioDto>,
  ) => Promise<boolean>;

  deleteServicio: (
    id: number,
  ) => Promise<boolean>;

  setFilters: (
    filters: Partial<ServicioFilters>,
  ) => void;

  clearSelectedServicio: () => void;
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
        data?: Record<string, unknown> | string;
      };
    };

    const data = axiosError.response?.data;

    if (typeof data === 'string') {
      return data;
    }

    if (data && typeof data === 'object') {
      const nombreError = data.nombre;

      if (Array.isArray(nombreError)) {
        return String(nombreError[0]);
      }

      if (typeof nombreError === 'string') {
        return nombreError;
      }

      const detail = data.detail;

      if (typeof detail === 'string') {
        return detail;
      }

      const firstValue = Object.values(data)[0];

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

export const useServicioStore =
  create<ServicioState>((set, get) => ({
    servicios: [],
    selectedServicio: null,
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

    fetchServicios: async (newFilters = {}) => {
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
          await getServiciosUseCase.execute(filters);

        set({
          servicios: response.results,
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

    fetchServicioById: async (id) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const servicio =
          await getServicioUseCase.execute(id);

        set({
          selectedServicio: servicio,
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
          await getServicioStatsUseCase.execute();

        set({ stats });
      } catch (error) {
        set({
          error: getErrorMessage(error),
        });
      }
    },

    createServicio: async (dto) => {
      set({
        isSaving: true,
        error: null,
        successMessage: null,
      });

      try {
        await createServicioUseCase.execute(dto);

        set({
          isSaving: false,
          successMessage:
            'Servicio creado correctamente.',
        });

        await Promise.all([
          get().fetchServicios(),
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

    updateServicio: async (id, dto) => {
      set({
        isSaving: true,
        error: null,
        successMessage: null,
      });

      try {
        const updatedServicio =
          await updateServicioUseCase.execute(
            id,
            dto,
          );

        set((state) => ({
          servicios: state.servicios.map(
            (servicio) =>
              servicio.id === id
                ? updatedServicio
                : servicio,
          ),
          selectedServicio:
            state.selectedServicio?.id === id
              ? updatedServicio
              : state.selectedServicio,
          isSaving: false,
          successMessage:
            'Servicio actualizado correctamente.',
        }));

        await Promise.all([
          get().fetchServicios(),
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

    deleteServicio: async (id) => {
      set({
        isSaving: true,
        error: null,
        successMessage: null,
      });

      try {
        await deleteServicioUseCase.execute(id);

        set({
          isSaving: false,
          successMessage:
            'Servicio eliminado correctamente.',
        });

        await Promise.all([
          get().fetchServicios(),
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

    clearSelectedServicio: () => {
      set({
        selectedServicio: null,
      });
    },

    clearMessages: () => {
      set({
        error: null,
        successMessage: null,
      });
    },
  }));