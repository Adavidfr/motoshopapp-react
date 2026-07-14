// src/presentation/store/moto.store.ts
import { create } from 'zustand';
import type { Moto } from '../../domain/entities/moto.entity';
import type { ListMotosParams } from '../../domain/ports/moto.repository';
import { listMotosUseCase, getMotoUseCase } from '../../infrastructure/factories/moto.factory';

interface MotoState {
  motos: Moto[];
  totalCount: number;
  selectedMoto: Moto | null;
  isLoading: boolean;
  error: string | null;
  fetchMotos: (params?: ListMotosParams) => Promise<void>;
  fetchMotoById: (id: number) => Promise<void>;
  clearSelectedMoto: () => void;
}

export const useMotoStore = create<MotoState>((set) => ({
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

  clearSelectedMoto: () => set({ selectedMoto: null }),
}));
