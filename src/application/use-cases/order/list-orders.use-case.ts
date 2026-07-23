// src/application/use-cases/order/list-orders.use-case.ts
import type { OrderRepository } from '../../../domain/ports/order.repository';
import type { Pedido, OrderListFilters } from '../../../domain/entities/order.entity';
import type { PaginatedResult } from '../../../domain/ports/moto.repository';

export class ListOrdersUseCase {
  private orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  execute(filters?: OrderListFilters): Promise<PaginatedResult<Pedido>> {
    return this.orderRepository.listOrders(filters);
  }
}
