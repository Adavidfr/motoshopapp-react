// src/domain/entities/order.entity.ts
import type { CarritoCompras } from './cart.entity';

export type PedidoEstado = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Pedido {
  idPedido: number;
  usernameCliente: string;
  idUsuarioCliente: number;
  idCarrito: number;
  carrito?: CarritoCompras;
  estado: PedidoEstado;
  total: number;
  fechaPedido: string;
}

export interface PedidoCreatePayload {
  id_carrito: number;
}

export interface OrderListFilters {
  page?: number;
  limit?: number;
  estado?: PedidoEstado | string;
}
