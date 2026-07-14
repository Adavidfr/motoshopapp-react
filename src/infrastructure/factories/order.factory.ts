// src/infrastructure/factories/order.factory.ts
import { ApiOrderRepository } from '../adapters/api-order.repository';
import { CreateOrderUseCase } from '../../application/use-cases/order/create-order.use-case';
import { ListOrdersUseCase } from '../../application/use-cases/order/list-orders.use-case';
import { GetOrderUseCase } from '../../application/use-cases/order/get-order.use-case';
import { ConfirmOrderUseCase } from '../../application/use-cases/order/confirm-order.use-case';

const orderRepository = new ApiOrderRepository();

export const createOrderUseCase = new CreateOrderUseCase(orderRepository);
export const listOrdersUseCase = new ListOrdersUseCase(orderRepository);
export const getOrderUseCase = new GetOrderUseCase(orderRepository);
export const confirmOrderUseCase = new ConfirmOrderUseCase(orderRepository);
