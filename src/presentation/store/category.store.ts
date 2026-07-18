// src/presentation/store/category.store.ts
import { create } from 'zustand';
import type { CategoriaMoto } from '../../domain/entities/categoria.entity';
import { listCategoriesUseCase, createCategoryUseCase, updateCategoryUseCase } from '../../infrastructure/factories/category.factory';

interface CategoryState {
  categories: CategoriaMoto[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (category: Omit<CategoriaMoto, 'idCategoria'>) => Promise<void>;
  updateCategory: (id: number, category: Partial<CategoriaMoto>) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await listCategoriesUseCase.execute();
      set({ categories: result, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al cargar las categorías',
        isLoading: false,
      });
    }
  },

  createCategory: async (category) => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await createCategoryUseCase.execute(category);
      set({
        categories: [...get().categories, newCategory],
        isLoading: false,
      });
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Error al crear la categoría';
      set({ error: detail, isLoading: false });
      throw err;
    }
  },

  updateCategory: async (id, category) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCategory = await updateCategoryUseCase.execute(id, category);
      set({
        categories: get().categories.map((c) => (c.idCategoria === id ? updatedCategory : c)),
        isLoading: false,
      });
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Error al actualizar la categoría';
      set({ error: detail, isLoading: false });
      throw err;
    }
  },
}));
