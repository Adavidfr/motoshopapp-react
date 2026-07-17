// src/presentation/store/brand.store.ts
import { create } from 'zustand';
import type { Marca } from '../../domain/entities/marca.entity';
import { listBrandsUseCase, createBrandUseCase, updateBrandUseCase } from '../../infrastructure/factories/brand.factory';

interface BrandState {
  brands: Marca[];
  isLoading: boolean;
  error: string | null;
  fetchBrands: () => Promise<void>;
  createBrand: (brand: Omit<Marca, 'idMarca'>) => Promise<void>;
  updateBrand: (id: number, brand: Partial<Marca>) => Promise<void>;
}

export const useBrandStore = create<BrandState>((set, get) => ({
  brands: [],
  isLoading: false,
  error: null,

  fetchBrands: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await listBrandsUseCase.execute();
      set({ brands: result, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al cargar las marcas',
        isLoading: false,
      });
    }
  },

  createBrand: async (brand) => {
    set({ isLoading: true, error: null });
    try {
      const newBrand = await createBrandUseCase.execute(brand);
      set({
        brands: [...get().brands, newBrand],
        isLoading: false,
      });
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Error al crear la marca';
      set({ error: detail, isLoading: false });
      throw err;
    }
  },

  updateBrand: async (id, brand) => {
    set({ isLoading: true, error: null });
    try {
      const updatedBrand = await updateBrandUseCase.execute(id, brand);
      set({
        brands: get().brands.map((b) => (b.idMarca === id ? updatedBrand : b)),
        isLoading: false,
      });
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Error al actualizar la marca';
      set({ error: detail, isLoading: false });
      throw err;
    }
  },
}));
