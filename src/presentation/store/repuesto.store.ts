// src/presentation/store/repuesto.store.ts
import { create } from 'zustand';
import type { Repuesto } from '../../domain/entities/repuesto.entity';
import type { ListRepuestosParams } from '../../domain/ports/repuesto.repository';
import { listRepuestosUseCase, createRepuestoUseCase, updateRepuestoUseCase, deleteRepuestoUseCase } from '../../infrastructure/factories/repuesto.factory';

interface RepuestoState {
  repuestos: Repuesto[];
  isLoading: boolean;
  error: string | null;
  fetchRepuestos: (params?: ListRepuestosParams) => Promise<void>;
  createRepuesto: (formData: FormData) => Promise<void>;
  updateRepuesto: (id: number, formData: FormData) => Promise<void>;
  deleteRepuesto: (id: number) => Promise<void>;
}

export const useRepuestoStore = create<RepuestoState>((set, get) => ({
  repuestos: [],
  isLoading: false,
  error: null,

  fetchRepuestos: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const result = await listRepuestosUseCase.execute(params);
      set({ repuestos: result, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al cargar los repuestos',
        isLoading: false,
      });
    }
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
}));
