// src/presentation/store/moto.store.ts
import { create } from 'zustand';
import type { Moto } from '../../domain/entities/moto.entity';
import type { ListMotosParams } from '../../domain/ports/moto.repository';
import { listMotosUseCase, getMotoUseCase, createMotoUseCase, updateMotoUseCase, deleteMotoUseCase } from '../../infrastructure/factories/moto.factory';

interface MotoState {
  motos: Moto[];
  totalCount: number;
  selectedMoto: Moto | null;
  isLoading: boolean;
  error: string | null;
  fetchMotos: (params?: ListMotosParams) => Promise<void>;
  fetchMotoById: (id: number) => Promise<void>;
  createMoto: (formData: FormData) => Promise<void>;
  updateMoto: (id: number, formData: FormData) => Promise<void>;
  deleteMoto: (id: number) => Promise<void>;
  clearSelectedMoto: () => void;
}

export const useMotoStore = create<MotoState>((set, get) => ({
  motos: [],
  totalCount: 0,
  selectedMoto: null,
  isLoading: false,
  error: null,

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

  createMoto: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      await createMotoUseCase.execute(formData);
      set({ isLoading: false });
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Error al crear la moto';
      set({ error: detail, isLoading: false });
      throw err;
    }
  },

  updateMoto: async (id, formData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateMotoUseCase.execute(id, formData);
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
