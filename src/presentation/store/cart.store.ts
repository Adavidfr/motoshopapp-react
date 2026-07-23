// src/presentation/store/cart.store.ts
import { create } from 'zustand';
import type { CarritoCompras } from '../../domain/entities/cart.entity';
import { getActiveCartUseCase, addItemToCartUseCase, removeItemFromCartUseCase, clearCartUseCase } from '../../infrastructure/factories/cart.factory';
import { parseApiError } from '../../infrastructure/http/api-error';

interface CartState {
  cart: CarritoCompras | null;
  isLoading: boolean;
  error: string | null;
  fetchActiveCart: () => Promise<void>;
  addToCart: (motoId: number | null, repuestoId: number | null, cantidad: number) => Promise<void>;
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
    } catch (err: unknown) {
      set({
        error: parseApiError(err, 'Error al cargar el carrito activo'),
        isLoading: false,
      });
    }
  },

  addToCart: async (motoId, repuestoId, cantidad) => {
    set({ isLoading: true, error: null });
    try {
      let currentCart = get().cart;
      if (!currentCart) {
        currentCart = await getActiveCartUseCase.execute();
      }
      const updatedCart = await addItemToCartUseCase.execute(
        currentCart.idCarrito,
        motoId,
        repuestoId,
        cantidad,
      );
      set({ cart: updatedCart, isLoading: false });
    } catch (err: unknown) {
      set({
        error: parseApiError(err, 'Error al agregar elemento al carrito'),
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
      const updatedCart = await getActiveCartUseCase.execute();
      set({ cart: updatedCart, isLoading: false });
    } catch (err: unknown) {
      set({
        error: parseApiError(err, 'Error al remover elemento del carrito'),
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
    } catch (err: unknown) {
      set({
        error: parseApiError(err, 'Error al vaciar el carrito'),
        isLoading: false,
      });
    }
  },

  clearCartState: () => set({ cart: null, error: null }),
}));
