// src/application/use-cases/order/list-orders.use-case.ts
import type { OrderRepository } from '../../../domain/ports/order.repository';
import type { Pedido } from '../../../domain/entities/order.entity';
import type { PaginatedResult } from '../../../domain/ports/moto.repository';

export class ListOrdersUseCase {
  private orderRepository: OrderRepository;
  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(limit?: number, offset?: number): Promise<PaginatedResult<Pedido>> {
    return this.orderRepository.listOrders(limit, offset);
  }
}
