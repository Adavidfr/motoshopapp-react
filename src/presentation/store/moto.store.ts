// src/presentation/store/moto.store.ts
import { create } from 'zustand';
import type { Moto, MotoCreatePayload, MotoUpdatePayload } from '../../domain/entities/moto.entity';
import type { ListMotosParams } from '../../domain/ports/moto.repository';
import { listMotosUseCase, getMotoUseCase, createMotoUseCase, updateMotoUseCase, deleteMotoUseCase } from '../../infrastructure/factories/moto.factory';
import { parseApiError } from '../../infrastructure/http/api-error';

interface MotoState {
  motos: Moto[];
  totalCount: number;
  selectedMoto: Moto | null;
  isLoading: boolean;
  error: string | null;
  loadingMotoIds: number[];
  unavailableMotoIds: number[];
  fetchMotos: (params?: ListMotosParams) => Promise<void>;
  fetchMotoById: (id: number) => Promise<void>;
  ensureMotosByIds: (ids: number[]) => Promise<void>;
  createMoto: (payload: MotoCreatePayload) => Promise<void>;
  updateMoto: (id: number, payload: MotoUpdatePayload) => Promise<void>;
  deleteMoto: (id: number) => Promise<void>;
  clearSelectedMoto: () => void;
}

export const useMotoStore = create<MotoState>((set, get) => ({
  motos: [],
  totalCount: 0,
  selectedMoto: null,
  isLoading: false,
  error: null,
  loadingMotoIds: [],
  unavailableMotoIds: [],

  fetchMotos: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const result = await listMotosUseCase.execute(params);
      set({
        motos: result.results,
        totalCount: result.count,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al cargar las motos',
        isLoading: false,
      });
    }
  },

  fetchMotoById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const moto = await getMotoUseCase.execute(id);
      set({ selectedMoto: moto, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al cargar los detalles de la moto',
        isLoading: false,
      });
    }
  },

  ensureMotosByIds: async (ids) => {
    const uniqueIds = [...new Set(ids.filter((id) => id > 0))];
    const state = get();
    const toFetch = uniqueIds.filter(
      (id) =>
        !state.motos.some((m) => m.idMoto === id) &&
        !state.unavailableMotoIds.includes(id) &&
        !state.loadingMotoIds.includes(id),
    );
    if (toFetch.length === 0) {
      return;
    }

    set({ loadingMotoIds: [...get().loadingMotoIds, ...toFetch] });

    await Promise.all(
      toFetch.map(async (id) => {
        try {
          const moto = await getMotoUseCase.execute(id);
          set((current) => ({
            motos: current.motos.some((m) => m.idMoto === id)
              ? current.motos
              : [...current.motos, moto],
            loadingMotoIds: current.loadingMotoIds.filter((loadingId) => loadingId !== id),
          }));
        } catch {
          set((current) => ({
            unavailableMotoIds: current.unavailableMotoIds.includes(id)
              ? current.unavailableMotoIds
              : [...current.unavailableMotoIds, id],
            loadingMotoIds: current.loadingMotoIds.filter((loadingId) => loadingId !== id),
          }));
        }
      }),
    );
  },

  createMoto: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await createMotoUseCase.execute(payload);
      set((state) => ({
        motos: state.motos.some((m) => m.idMoto === created.idMoto)
          ? state.motos.map((m) => (m.idMoto === created.idMoto ? created : m))
          : [created, ...state.motos],
        selectedMoto: state.selectedMoto?.idMoto === created.idMoto ? created : state.selectedMoto,
        isLoading: false,
      }));
    } catch (err: unknown) {
      set({ error: parseApiError(err, 'Error al crear la moto'), isLoading: false });
      throw err;
    }
  },

  updateMoto: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateMotoUseCase.execute(id, payload);
      set({
        selectedMoto: updated,
        motos: get().motos.map((m) => (m.idMoto === id ? updated : m)),
        isLoading: false,
      });
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Error al actualizar la moto';
      set({ error: detail, isLoading: false });
      throw err;
    }
  },

  deleteMoto: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteMotoUseCase.execute(id);
      set({
        motos: get().motos.filter((m) => m.idMoto !== id),
        totalCount: Math.max(0, get().totalCount - 1),
        isLoading: false,
      });
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Error al eliminar la moto';
      set({ error: detail, isLoading: false });
      throw err;
    }
  },

  clearSelectedMoto: () => set({ selectedMoto: null }),
}));
