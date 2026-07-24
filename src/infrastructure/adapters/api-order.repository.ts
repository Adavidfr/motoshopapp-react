// src/infrastructure/adapters/api-order.repository.ts
import type { OrderRepository } from '../../domain/ports/order.repository';
import type { Pedido, PedidoEstado, OrderListFilters } from '../../domain/entities/order.entity';
import type { CarritoCompras, CarritoEstado, ItemCarrito } from '../../domain/entities/cart.entity';
import type { PaginatedResult } from '../../domain/ports/moto.repository';
import { httpClient } from '../http/axios-client';

interface ApiCartItem {
  id_item: number;
  id_carrito: number;
  id_moto: number | null;
  id_repuesto: number | null;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
}

interface ApiCart {
  id_carrito: number;
  username_cliente: string;
  id_usuario_cliente: number;
  estado: string;
  fecha_creacion: string;
  num_items: number;
  total: string;
  items?: ApiCartItem[];
}

interface ApiPedido {
  id_pedido: number;
  username_cliente: string;
  id_usuario_cliente: number;
  id_carrito: number;
  carrito?: ApiCart;
  estado: PedidoEstado;
  total: string | number;
  fecha_pedido: string;
}

export class ApiOrderRepository implements OrderRepository {
  private mapItem(data: ApiCartItem): ItemCarrito {
    return {
      idItem: data.id_item,
      idCarrito: data.id_carrito,
      idMoto: data.id_moto,
      idRepuesto: data.id_repuesto,
      cantidad: data.cantidad,
      precioUnitario: Number(data.precio_unitario),
      subtotal: Number(data.subtotal),
    };
  }

  private mapCart(data: ApiCart): CarritoCompras {
    return {
      idCarrito: data.id_carrito,
      usernameCliente: data.username_cliente,
      idUsuarioCliente: data.id_usuario_cliente,
      estado: data.estado as CarritoEstado,
      fechaCreacion: data.fecha_creacion,
      numItems: Number(data.num_items),
      total: Number(data.total),
      items: (data.items || []).map((i) => this.mapItem(i)),
    };
  }

  private mapOrder(data: ApiPedido): Pedido {
    return {
      idPedido: data.id_pedido,
      usernameCliente: data.username_cliente,
      idUsuarioCliente: data.id_usuario_cliente,
      idCarrito: data.id_carrito,
      carrito: data.carrito ? this.mapCart(data.carrito) : undefined,
      estado: data.estado,
      total: Number(data.total),
      fechaPedido: data.fecha_pedido,
    };
  }

  async createOrder(cartId: number): Promise<Pedido> {
    const response = await httpClient.post<ApiPedido>('/pedidos/', {
      id_carrito: cartId,
    });
    return this.mapOrder(response.data);
  }

  async listOrders(filters: OrderListFilters = {}): Promise<PaginatedResult<Pedido>> {
    const params: Record<string, string | number> = {};
    if (filters.page !== undefined) params.page = filters.page;
    if (filters.limit !== undefined) params.limit = filters.limit;
    if (filters.estado) params.estado = filters.estado;

    const response = await httpClient.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: ApiPedido[];
    }>('/pedidos/', { params });

    return {
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
      results: response.data.results.map((item) => this.mapOrder(item)),
    };
  }

  async getOrder(id: number): Promise<Pedido> {
    const response = await httpClient.get<ApiPedido>(`/pedidos/${id}/`);
    return this.mapOrder(response.data);
  }

  async confirmOrder(id: number): Promise<Pedido> {
    const response = await httpClient.post<ApiPedido>(`/pedidos/${id}/confirm/`);
    return this.mapOrder(response.data);
  }

  async updateOrderStatus(id: number, estado: PedidoEstado): Promise<Pedido> {
    const response = await httpClient.post<ApiPedido>(`/pedidos/${id}/update-status/`, {
      estado,
    });
    return this.mapOrder(response.data);
  }
}
