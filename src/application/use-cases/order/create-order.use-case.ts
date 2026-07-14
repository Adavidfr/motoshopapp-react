// src/application/use-cases/order/create-order.use-case.ts
import type { OrderRepository } from '../../../domain/ports/order.repository';
import type { Pedido } from '../../../domain/entities/order.entity';

export class CreateOrderUseCase {
  private orderRepository: OrderRepository;
  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(cartId: number): Promise<Pedido> {
    return this.orderRepository.createOrder(cartId);
  }
}
