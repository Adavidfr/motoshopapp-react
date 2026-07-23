// src/presentation/store/order.store.ts
import { create } from 'zustand';
import type { Pedido, OrderListFilters } from '../../domain/entities/order.entity';
import { createOrderUseCase, listOrdersUseCase, getOrderUseCase, confirmOrderUseCase } from '../../infrastructure/factories/order.factory';
import { parseApiError } from '../../infrastructure/http/api-error';

interface OrderState {
  orders: Pedido[];
  selectedOrder: Pedido | null;
  isLoading: boolean;
  isConfirming: boolean;
  error: string | null;
  createOrder: (cartId: number) => Promise<Pedido>;
  fetchOrders: (filters?: OrderListFilters) => Promise<void>;
  fetchOrderById: (id: number) => Promise<void>;
  confirmOrder: (id: number) => Promise<Pedido>;
  clearSelectedOrder: () => void;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  isLoading: false,
  isConfirming: false,
  error: null,

  createOrder: async (cartId) => {
    set({ isLoading: true, error: null });
    try {
      const order = await createOrderUseCase.execute(cartId);
      set({ isLoading: false });
      return order;
    } catch (err: unknown) {
      const message = parseApiError(err, 'Error al crear el pedido');
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  fetchOrders: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const result = await listOrdersUseCase.execute(filters);
      set({ orders: result.results, isLoading: false });
    } catch (err: unknown) {
      set({
        error: parseApiError(err, 'Error al obtener el historial de pedidos'),
        isLoading: false,
      });
    }
  },

  fetchOrderById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const order = await getOrderUseCase.execute(id);
      set({ selectedOrder: order, isLoading: false });
    } catch (err: unknown) {
      set({
        error: parseApiError(err, 'Error al cargar el detalle del pedido'),
        isLoading: false,
      });
    }
  },

  confirmOrder: async (id) => {
    const current = get().selectedOrder;
    if (current && current.idPedido === id && current.estado !== 'pending') {
      const message = 'Este pedido ya fue confirmado o no puede confirmarse.';
      set({ error: message });
      throw new Error(message);
    }

    set({ isConfirming: true, error: null });
    try {
      const confirmedOrder = await confirmOrderUseCase.execute(id);
      set((state) => ({
        selectedOrder: confirmedOrder,
        orders: state.orders.map((o) =>
          o.idPedido === id ? confirmedOrder : o,
        ),
        isConfirming: false,
      }));
      return confirmedOrder;
    } catch (err: unknown) {
      set({
        error: parseApiError(err, 'Error al confirmar el pedido'),
        isConfirming: false,
      });
      throw err;
    }
  },

  clearSelectedOrder: () => set({ selectedOrder: null }),
  clearError: () => set({ error: null }),
}));
