// src/application/use-cases/order/update-order-status.use-case.ts
import type { OrderRepository } from '../../../domain/ports/order.repository';
import type { Pedido, PedidoEstado } from '../../../domain/entities/order.entity';

export class UpdateOrderStatusUseCase {
  private orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(id: number, estado: PedidoEstado): Promise<Pedido> {
    return this.orderRepository.updateOrderStatus(id, estado);
  }
}
