// src/presentation/store/order.store.ts
import { create } from 'zustand';
import type { Pedido } from '../../domain/entities/order.entity';
import { createOrderUseCase, listOrdersUseCase, getOrderUseCase, confirmOrderUseCase } from '../../infrastructure/factories/order.factory';

interface OrderState {
  orders: Pedido[];
  selectedOrder: Pedido | null;
  isLoading: boolean;
  error: string | null;
  createOrder: (cartId: number) => Promise<Pedido>;
  fetchOrders: (limit?: number, offset?: number) => Promise<void>;
  fetchOrderById: (id: number) => Promise<void>;
  confirmOrder: (id: number) => Promise<void>;
  clearSelectedOrder: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,

  createOrder: async (cartId) => {
    set({ isLoading: true, error: null });
    try {
      const order = await createOrderUseCase.execute(cartId);
      set({ isLoading: false });
      return order;
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al crear el pedido',
        isLoading: false,
      });
      throw err;
    }
  },

  fetchOrders: async (limit, offset) => {
    set({ isLoading: true, error: null });
    try {
      const result = await listOrdersUseCase.execute(limit, offset);
      set({ orders: result.results, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al obtener el historial de pedidos',
        isLoading: false,
      });
    }
  },

  fetchOrderById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const order = await getOrderUseCase.execute(id);
      set({ selectedOrder: order, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al cargar el detalle del pedido',
        isLoading: false,
      });
    }
  },

  confirmOrder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const confirmedOrder = await confirmOrderUseCase.execute(id);
      set({ selectedOrder: confirmedOrder, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al confirmar el pedido',
        isLoading: false,
      });
      throw err;
    }
  },

  clearSelectedOrder: () => set({ selectedOrder: null }),
}));
