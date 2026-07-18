// src/presentation/store/inventory.store.ts
import { create } from 'zustand';
import type { MovimientoInventario } from '../../domain/entities/movimiento-inventario.entity';
import { listMovimientosUseCase, createMovimientoUseCase } from '../../infrastructure/factories/inventory.factory';

interface InventoryState {
  movements: MovimientoInventario[];
  isLoading: boolean;
  error: string | null;
  fetchMovements: () => Promise<void>;
  createMovement: (payload: any) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  movements: [],
  isLoading: false,
  error: null,

  fetchMovements: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await listMovimientosUseCase.execute();
      set({ movements: result, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al cargar los movimientos de inventario',
        isLoading: false,
      });
    }
  },

  createMovement: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const newMovement = await createMovimientoUseCase.execute(payload);
      set({
        movements: [newMovement, ...get().movements],
        isLoading: false,
      });
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Error al registrar el movimiento';
      set({ error: detail, isLoading: false });
      throw err;
    }
  },
}));
