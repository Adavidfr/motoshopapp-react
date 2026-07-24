// src/domain/ports/order.repository.ts
import type { Pedido, PedidoEstado, OrderListFilters } from '../entities/order.entity';
import type { PaginatedResult } from './moto.repository';

export interface OrderRepository {
  createOrder(cartId: number): Promise<Pedido>;
  listOrders(filters?: OrderListFilters): Promise<PaginatedResult<Pedido>>;
  getOrder(id: number): Promise<Pedido>;
  confirmOrder(id: number): Promise<Pedido>;
  /** Admin: POST /pedidos/{id}/update-status/ — flujo logístico del pedido. */
  updateOrderStatus(id: number, estado: PedidoEstado): Promise<Pedido>;
}
