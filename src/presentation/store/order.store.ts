// src/presentation/store/order.store.ts
import { create } from 'zustand';
import type { Pedido, PedidoEstado, OrderListFilters } from '../../domain/entities/order.entity';
import {
  createOrderUseCase,
  listOrdersUseCase,
  getOrderUseCase,
  confirmOrderUseCase,
  updateOrderStatusUseCase,
} from '../../infrastructure/factories/order.factory';
import { parseApiError } from '../../infrastructure/http/api-error';

/** Transiciones logísticas alineadas con PEDIDO_TRANSICIONES del backend. */
const PEDIDO_TRANSICIONES: Record<PedidoEstado, PedidoEstado[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

interface OrderState {
  orders: Pedido[];
  selectedOrder: Pedido | null;
  isLoading: boolean;
  isConfirming: boolean;
  isUpdatingStatus: boolean;
  error: string | null;
  successMessage: string | null;
  createOrder: (cartId: number) => Promise<Pedido>;
  fetchOrders: (filters?: OrderListFilters) => Promise<void>;
  fetchOrderById: (id: number) => Promise<void>;
  confirmOrder: (id: number) => Promise<Pedido>;
  updateOrderStatus: (id: number, estado: PedidoEstado) => Promise<Pedido>;
  clearSelectedOrder: () => void;
  clearError: () => void;
  clearMessages: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  isLoading: false,
  isConfirming: false,
  isUpdatingStatus: false,
  error: null,
  successMessage: null,

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

  updateOrderStatus: async (id, estado) => {
    const current =
      get().orders.find((o) => o.idPedido === id) ??
      (get().selectedOrder?.idPedido === id ? get().selectedOrder : null);

    if (current) {
      const permitidos = PEDIDO_TRANSICIONES[current.estado] ?? [];
      if (!permitidos.includes(estado)) {
        const message = `Transición inválida: "${current.estado}" → "${estado}".`;
        set({ error: message, successMessage: null });
        throw new Error(message);
      }
    }

    set({ isUpdatingStatus: true, error: null, successMessage: null });
    try {
      const updated = await updateOrderStatusUseCase.execute(id, estado);
      set((state) => ({
        orders: state.orders.map((o) => (o.idPedido === id ? updated : o)),
        selectedOrder:
          state.selectedOrder?.idPedido === id ? updated : state.selectedOrder,
        isUpdatingStatus: false,
        successMessage: `Pedido #${id} actualizado a ${estado}.`,
      }));
      return updated;
    } catch (err: unknown) {
      set({
        error: parseApiError(err, 'Error al actualizar el estado del pedido'),
        isUpdatingStatus: false,
      });
      throw err;
    }
  },

  clearSelectedOrder: () => set({ selectedOrder: null }),
  clearError: () => set({ error: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
