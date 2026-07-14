// src/presentation/store/cart.store.ts
import { create } from 'zustand';
import type { CarritoCompras } from '../../domain/entities/cart.entity';
import { getActiveCartUseCase, addItemToCartUseCase, removeItemFromCartUseCase, clearCartUseCase } from '../../infrastructure/factories/cart.factory';

interface CartState {
  cart: CarritoCompras | null;
  isLoading: boolean;
  error: string | null;
  fetchActiveCart: () => Promise<void>;
  addToCart: (motoId: number, cantidad: number, precioUnitario: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  clearCartState: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchActiveCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await getActiveCartUseCase.execute();
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al cargar el carrito activo',
        isLoading: false,
      });
    }
  },

  addToCart: async (motoId, cantidad, precioUnitario) => {
    set({ isLoading: true, error: null });
    try {
      let currentCart = get().cart;
      if (!currentCart) {
        currentCart = await getActiveCartUseCase.execute();
      }
      const updatedCart = await addItemToCartUseCase.execute(currentCart.idCarrito, motoId, cantidad, precioUnitario);
      set({ cart: updatedCart, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al agregar elemento al carrito',
        isLoading: false,
      });
      throw err;
    }
  },

  removeFromCart: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      const currentCart = get().cart;
      if (!currentCart) return;
      await removeItemFromCartUseCase.execute(currentCart.idCarrito, itemId);
      
      // Volvemos a obtener el carrito para tener los cálculos actualizados
      const updatedCart = await getActiveCartUseCase.execute();
      set({ cart: updatedCart, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al remover elemento del carrito',
        isLoading: false,
      });
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const currentCart = get().cart;
      if (!currentCart) return;
      const updatedCart = await clearCartUseCase.execute(currentCart.idCarrito);
      set({ cart: updatedCart, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al vaciar el carrito',
        isLoading: false,
      });
    }
  },

  clearCartState: () => set({ cart: null, error: null }),
}));
