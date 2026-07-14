// src/domain/ports/order.repository.ts
import type { Pedido } from '../entities/order.entity';
import type { PaginatedResult } from './moto.repository';

export interface OrderRepository {
  createOrder(cartId: number): Promise<Pedido>;
  listOrders(limit?: number, offset?: number): Promise<PaginatedResult<Pedido>>;
  getOrder(id: number): Promise<Pedido>;
  confirmOrder(id: number): Promise<Pedido>;
}
