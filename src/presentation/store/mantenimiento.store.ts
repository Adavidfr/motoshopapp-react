import { create } from 'zustand';

import type {
  Mantenimiento,
  MantenimientoStats,
} from '../../domain/entities/mantenimiento.entity';

import type {
  MantenimientoDto,
  MantenimientoFilters,
} from '../../application/dtos/mantenimiento.dto';

import {
  createMantenimientoUseCase,
  deleteMantenimientoUseCase,
  getMantenimientoStatsUseCase,
  getMantenimientoUseCase,
  getMantenimientosUseCase,
  updateMantenimientoUseCase,
} from '../../infrastructure/factories/mantenimiento.factory';

interface MantenimientoState {
  mantenimientos: Mantenimiento[];
  selectedMantenimiento: Mantenimiento | null;
  stats: MantenimientoStats | null;

  count: number;
  next: string | null;
  previous: string | null;

  filters: MantenimientoFilters;

  isLoading: boolean;
  isSaving: boolean;

  error: string | null;
  successMessage: string | null;

  fetchMantenimientos: (
    filters?: MantenimientoFilters,
  ) => Promise<void>;

  fetchMantenimientoById: (
    id: number,
  ) => Promise<void>;

  fetchStats: () => Promise<void>;

  createMantenimiento: (
    dto: MantenimientoDto,
  ) => Promise<boolean>;

  updateMantenimiento: (
    id: number,
    dto: Partial<MantenimientoDto>,
  ) => Promise<boolean>;

  deleteMantenimiento: (
    id: number,
  ) => Promise<boolean>;

  setFilters: (
    filters: Partial<MantenimientoFilters>,
  ) => void;

  clearSelectedMantenimiento: () => void;
  clearMessages: () => void;
}

const getErrorMessage = (
  error: unknown,
): string => {
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

    if (
      data &&
      typeof data === 'object'
    ) {
      const detail = data.detail;

      if (typeof detail === 'string') {
        return detail;
      }

      const nonFieldErrors =
        data.non_field_errors;

      if (Array.isArray(nonFieldErrors)) {
        return String(nonFieldErrors[0]);
      }

      const kilometrajeError =
        data.kilometraje_actual;

      if (Array.isArray(kilometrajeError)) {
        return String(kilometrajeError[0]);
      }

      if (
        typeof kilometrajeError ===
        'string'
      ) {
        return kilometrajeError;
      }

      const costoError =
        data.costo_final;

      if (Array.isArray(costoError)) {
        return String(costoError[0]);
      }

      if (
        typeof costoError === 'string'
      ) {
        return costoError;
      }

      const firstValue =
        Object.values(data)[0];

      if (Array.isArray(firstValue)) {
        return String(firstValue[0]);
      }

      if (
        typeof firstValue === 'string'
      ) {
        return firstValue;
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado.';
};

export const useMantenimientoStore =
  create<MantenimientoState>(
    (set, get) => ({
      mantenimientos: [],
      selectedMantenimiento: null,
      stats: null,

      count: 0,
      next: null,
      previous: null,

      filters: {
        page: 1,
        pageSize: 10,
        ordering: '-fecha_registro',
      },

      isLoading: false,
      isSaving: false,

      error: null,
      successMessage: null,

      fetchMantenimientos: async (
        newFilters = {},
      ) => {
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
            await getMantenimientosUseCase.execute(
              filters,
            );

          set({
            mantenimientos:
              response.results,
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

      fetchMantenimientoById: async (
        id,
      ) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const mantenimiento =
            await getMantenimientoUseCase.execute(
              id,
            );

          set({
            selectedMantenimiento:
              mantenimiento,
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
            await getMantenimientoStatsUseCase.execute();

          set({ stats });
        } catch (error) {
          set({
            error: getErrorMessage(error),
          });
        }
      },

      createMantenimiento: async (
        dto,
      ) => {
        set({
          isSaving: true,
          error: null,
          successMessage: null,
        });

        try {
          await createMantenimientoUseCase.execute(
            dto,
          );

          set({
            isSaving: false,
            successMessage:
              'Mantenimiento creado correctamente.',
          });

          await Promise.all([
            get().fetchMantenimientos(),
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

      updateMantenimiento: async (
        id,
        dto,
      ) => {
        set({
          isSaving: true,
          error: null,
          successMessage: null,
        });

        try {
          const updatedMantenimiento =
            await updateMantenimientoUseCase.execute(
              id,
              dto,
            );

          set((state) => ({
            mantenimientos:
              state.mantenimientos.map(
                (mantenimiento) =>
                  mantenimiento.idMantenimiento ===
                  id
                    ? updatedMantenimiento
                    : mantenimiento,
              ),
            selectedMantenimiento:
              state.selectedMantenimiento
                ?.idMantenimiento === id
                ? updatedMantenimiento
                : state.selectedMantenimiento,
            isSaving: false,
            successMessage:
              'Mantenimiento actualizado correctamente.',
          }));

          await Promise.all([
            get().fetchMantenimientos(),
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

      deleteMantenimiento: async (
        id,
      ) => {
        set({
          isSaving: true,
          error: null,
          successMessage: null,
        });

        try {
          await deleteMantenimientoUseCase.execute(
            id,
          );

          set({
            isSaving: false,
            successMessage:
              'Mantenimiento eliminado correctamente.',
          });

          await Promise.all([
            get().fetchMantenimientos(),
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

      clearSelectedMantenimiento: () => {
        set({
          selectedMantenimiento: null,
        });
      },

      clearMessages: () => {
        set({
          error: null,
          successMessage: null,
        });
      },
    }),
  );