// src/presentation/store/repuesto.store.ts
import { create } from 'zustand';
import type { Repuesto } from '../../domain/entities/repuesto.entity';
import type { ListRepuestosParams } from '../../domain/ports/repuesto.repository';
import { listRepuestosUseCase, getRepuestoUseCase, createRepuestoUseCase, updateRepuestoUseCase, deleteRepuestoUseCase } from '../../infrastructure/factories/repuesto.factory';
import { parseApiError } from '../../infrastructure/http/api-error';

interface RepuestoState {
  repuestos: Repuesto[];
  totalCount: number;
  selectedRepuesto: Repuesto | null;
  isLoading: boolean;
  error: string | null;
  loadingRepuestoIds: number[];
  unavailableRepuestoIds: number[];
  fetchRepuestos: (params?: ListRepuestosParams) => Promise<void>;
  fetchRepuestoById: (id: number) => Promise<void>;
  ensureRepuestosByIds: (ids: number[]) => Promise<void>;
  createRepuesto: (formData: FormData) => Promise<void>;
  updateRepuesto: (id: number, formData: FormData) => Promise<void>;
  deleteRepuesto: (id: number) => Promise<void>;
  clearSelectedRepuesto: () => void;
}

export const useRepuestoStore = create<RepuestoState>((set, get) => ({
  repuestos: [],
  totalCount: 0,
  selectedRepuesto: null,
  isLoading: false,
  error: null,
  loadingRepuestoIds: [],
  unavailableRepuestoIds: [],

  fetchRepuestos: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const result = await listRepuestosUseCase.execute(params);
      set({ repuestos: result.results, totalCount: result.count, isLoading: false });
    } catch (err: unknown) {
      set({
        error: parseApiError(err, 'Error al cargar los repuestos'),
        isLoading: false,
      });
    }
  },

  fetchRepuestoById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const repuesto = await getRepuestoUseCase.execute(id);
      set({ selectedRepuesto: repuesto, isLoading: false });
    } catch (err: unknown) {
      set({
        error: parseApiError(err, 'Error al cargar el repuesto'),
        isLoading: false,
      });
    }
  },

  ensureRepuestosByIds: async (ids) => {
    const uniqueIds = [...new Set(ids.filter((id) => id > 0))];
    const state = get();
    const toFetch = uniqueIds.filter(
      (id) =>
        !state.repuestos.some((r) => r.idRepuesto === id) &&
        !state.unavailableRepuestoIds.includes(id) &&
        !state.loadingRepuestoIds.includes(id),
    );
    if (toFetch.length === 0) {
      return;
    }

    set({ loadingRepuestoIds: [...get().loadingRepuestoIds, ...toFetch] });

    await Promise.all(
      toFetch.map(async (id) => {
        try {
          const repuesto = await getRepuestoUseCase.execute(id);
          set((current) => ({
            repuestos: current.repuestos.some((r) => r.idRepuesto === id)
              ? current.repuestos
              : [...current.repuestos, repuesto],
            loadingRepuestoIds: current.loadingRepuestoIds.filter((loadingId) => loadingId !== id),
          }));
        } catch {
          set((current) => ({
            unavailableRepuestoIds: current.unavailableRepuestoIds.includes(id)
              ? current.unavailableRepuestoIds
              : [...current.unavailableRepuestoIds, id],
            loadingRepuestoIds: current.loadingRepuestoIds.filter((loadingId) => loadingId !== id),
          }));
        }
      }),
    );
  },

  createRepuesto: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      await createRepuestoUseCase.execute(formData);
      set({ isLoading: false });
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Error al crear el repuesto';
      set({ error: detail, isLoading: false });
      throw err;
    }
  },

  updateRepuesto: async (id, formData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateRepuestoUseCase.execute(id, formData);
      set({
        repuestos: get().repuestos.map((r) => (r.idRepuesto === id ? updated : r)),
        isLoading: false,
      });
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Error al actualizar el repuesto';
      set({ error: detail, isLoading: false });
      throw err;
    }
  },

  deleteRepuesto: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteRepuestoUseCase.execute(id);
      set({
        repuestos: get().repuestos.filter((r) => r.idRepuesto !== id),
        isLoading: false,
      });
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Error al eliminar el repuesto';
      set({ error: detail, isLoading: false });
      throw err;
    }
  },

  clearSelectedRepuesto: () => set({ selectedRepuesto: null }),
}));
