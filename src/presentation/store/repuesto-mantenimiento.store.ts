import { create } from 'zustand';

import type {
  RepuestoMantenimiento,
  RepuestoMantenimientoStats,
} from '../../domain/entities/repuesto-mantenimiento.entity';

import type {
  RepuestoMantenimientoDto,
  RepuestoMantenimientoFilters,
} from '../../application/dtos/repuesto-mantenimiento.dto';

import {
  createRepuestoMantenimientoUseCase,
  deleteRepuestoMantenimientoUseCase,
  getRepuestoMantenimientoStatsUseCase,
  getRepuestoMantenimientoUseCase,
  getRepuestosMantenimientoUseCase,
  updateRepuestoMantenimientoUseCase,
} from '../../infrastructure/factories/repuesto-mantenimiento.factory';

interface RepuestoMantenimientoState {
  repuestosMantenimiento:
    RepuestoMantenimiento[];

  selectedRepuestoMantenimiento:
    RepuestoMantenimiento | null;

  stats:
    RepuestoMantenimientoStats | null;

  count: number;
  next: string | null;
  previous: string | null;

  filters:
    RepuestoMantenimientoFilters;

  isLoading: boolean;
  isSaving: boolean;

  error: string | null;
  successMessage: string | null;

  fetchRepuestosMantenimiento: (
    filters?: RepuestoMantenimientoFilters,
  ) => Promise<void>;

  fetchRepuestoMantenimientoById: (
    id: number,
  ) => Promise<void>;

  fetchStats: () => Promise<void>;

  createRepuestoMantenimiento: (
    dto: RepuestoMantenimientoDto,
  ) => Promise<boolean>;

  updateRepuestoMantenimiento: (
    id: number,
    dto: Partial<RepuestoMantenimientoDto>,
  ) => Promise<boolean>;

  deleteRepuestoMantenimiento: (
    id: number,
  ) => Promise<boolean>;

  setFilters: (
    filters: Partial<RepuestoMantenimientoFilters>,
  ) => void;

  clearSelectedRepuestoMantenimiento:
    () => void;

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
        data?:
          | Record<string, unknown>
          | string;
      };
    };

    const data =
      axiosError.response?.data;

    if (typeof data === 'string') {
      return data;
    }

    if (
      data &&
      typeof data === 'object'
    ) {
      const detail = data.detail;

      if (
        typeof detail === 'string'
      ) {
        return detail;
      }

      const nonFieldErrors =
        data.non_field_errors;

      if (
        Array.isArray(
          nonFieldErrors,
        )
      ) {
        return String(
          nonFieldErrors[0],
        );
      }

      const cantidadError =
        data.cantidad;

      if (
        Array.isArray(
          cantidadError,
        )
      ) {
        return String(
          cantidadError[0],
        );
      }

      if (
        typeof cantidadError ===
        'string'
      ) {
        return cantidadError;
      }

      const precioError =
        data.precio_unitario;

      if (
        Array.isArray(
          precioError,
        )
      ) {
        return String(
          precioError[0],
        );
      }

      if (
        typeof precioError ===
        'string'
      ) {
        return precioError;
      }

      const subtotalError =
        data.subtotal;

      if (
        Array.isArray(
          subtotalError,
        )
      ) {
        return String(
          subtotalError[0],
        );
      }

      if (
        typeof subtotalError ===
        'string'
      ) {
        return subtotalError;
      }

      const firstValue =
        Object.values(data)[0];

      if (
        Array.isArray(
          firstValue,
        )
      ) {
        return String(
          firstValue[0],
        );
      }

      if (
        typeof firstValue ===
        'string'
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

export const useRepuestoMantenimientoStore =
  create<RepuestoMantenimientoState>(
    (set, get) => ({
      repuestosMantenimiento: [],

      selectedRepuestoMantenimiento:
        null,

      stats: null,

      count: 0,
      next: null,
      previous: null,

      filters: {
        page: 1,
        pageSize: 10,
        ordering:
          'id_repuesto_mantenimiento',
      },

      isLoading: false,
      isSaving: false,

      error: null,
      successMessage: null,

      fetchRepuestosMantenimiento:
        async (
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
              await getRepuestosMantenimientoUseCase.execute(
                filters,
              );

            set({
              repuestosMantenimiento:
                response.results,
              count: response.count,
              next: response.next,
              previous:
                response.previous,
              isLoading: false,
            });
          } catch (error) {
            set({
              isLoading: false,
              error:
                getErrorMessage(
                  error,
                ),
            });
          }
        },

      fetchRepuestoMantenimientoById:
        async (id) => {
          set({
            isLoading: true,
            error: null,
          });

          try {
            const item =
              await getRepuestoMantenimientoUseCase.execute(
                id,
              );

            set({
              selectedRepuestoMantenimiento:
                item,
              isLoading: false,
            });
          } catch (error) {
            set({
              isLoading: false,
              error:
                getErrorMessage(
                  error,
                ),
            });
          }
        },

      fetchStats: async () => {
        try {
          const stats =
            await getRepuestoMantenimientoStatsUseCase.execute();

          set({
            stats,
          });
        } catch (error) {
          set({
            error:
              getErrorMessage(
                error,
              ),
          });
        }
      },

      createRepuestoMantenimiento:
        async (dto) => {
          set({
            isSaving: true,
            error: null,
            successMessage: null,
          });

          try {
            await createRepuestoMantenimientoUseCase.execute(
              dto,
            );

            set({
              isSaving: false,
              successMessage:
                'Repuesto agregado al mantenimiento correctamente.',
            });

            await Promise.all([
              get()
                .fetchRepuestosMantenimiento(),
              get().fetchStats(),
            ]);

            return true;
          } catch (error) {
            set({
              isSaving: false,
              error:
                getErrorMessage(
                  error,
                ),
            });

            return false;
          }
        },

      updateRepuestoMantenimiento:
        async (id, dto) => {
          set({
            isSaving: true,
            error: null,
            successMessage: null,
          });

          try {
            const updatedItem =
              await updateRepuestoMantenimientoUseCase.execute(
                id,
                dto,
              );

            set((state) => ({
              repuestosMantenimiento:
                state.repuestosMantenimiento.map(
                  (item) =>
                    item.idRepuestoMantenimiento ===
                    id
                      ? updatedItem
                      : item,
                ),

              selectedRepuestoMantenimiento:
                state
                  .selectedRepuestoMantenimiento
                  ?.idRepuestoMantenimiento ===
                id
                  ? updatedItem
                  : state
                      .selectedRepuestoMantenimiento,

              isSaving: false,

              successMessage:
                'Repuesto de mantenimiento actualizado correctamente.',
            }));

            await Promise.all([
              get()
                .fetchRepuestosMantenimiento(),
              get().fetchStats(),
            ]);

            return true;
          } catch (error) {
            set({
              isSaving: false,
              error:
                getErrorMessage(
                  error,
                ),
            });

            return false;
          }
        },

      deleteRepuestoMantenimiento:
        async (id) => {
          set({
            isSaving: true,
            error: null,
            successMessage: null,
          });

          try {
            await deleteRepuestoMantenimientoUseCase.execute(
              id,
            );

            set({
              isSaving: false,
              successMessage:
                'Repuesto eliminado del mantenimiento correctamente.',
            });

            await Promise.all([
              get()
                .fetchRepuestosMantenimiento(),
              get().fetchStats(),
            ]);

            return true;
          } catch (error) {
            set({
              isSaving: false,
              error:
                getErrorMessage(
                  error,
                ),
            });

            return false;
          }
        },

      setFilters: (
        newFilters,
      ) => {
        set((state) => ({
          filters: {
            ...state.filters,
            ...newFilters,
          },
        }));
      },

      clearSelectedRepuestoMantenimiento:
        () => {
          set({
            selectedRepuestoMantenimiento:
              null,
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