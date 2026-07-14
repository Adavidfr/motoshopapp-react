// src/application/use-cases/order/confirm-order.use-case.ts
import type { OrderRepository } from '../../../domain/ports/order.repository';
import type { Pedido } from '../../../domain/entities/order.entity';

export class ConfirmOrderUseCase {
  private orderRepository: OrderRepository;
  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(id: number): Promise<Pedido> {
    return this.orderRepository.confirmOrder(id);
  }
}
