// src/infrastructure/adapters/api-order.repository.ts
import type { OrderRepository } from '../../domain/ports/order.repository';
import type { Pedido } from '../../domain/entities/order.entity';
import type { CarritoCompras, ItemCarrito } from '../../domain/entities/cart.entity';
import type { PaginatedResult } from '../../domain/ports/moto.repository';
import { httpClient } from '../http/axios-client';

export class ApiOrderRepository implements OrderRepository {
  private mapItem(data: any): ItemCarrito {
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

  private mapCart(data: any): CarritoCompras {
    return {
      idCarrito: data.id_carrito,
      usernameCliente: data.username_cliente,
      idUsuarioCliente: data.id_usuario_cliente,
      estado: data.estado,
      fechaCreacion: data.fecha_creacion,
      numItems: Number(data.num_items),
      total: Number(data.total),
      items: (data.items || []).map((i: any) => this.mapItem(i)),
    };
  }

  private mapOrder(data: any): Pedido {
    return {
      idPedido: data.id_pedido,
      usernameCliente: data.username_cliente,
      idUsuarioCliente: data.id_usuario_cliente,
      idCarrito: data.id_carrito,
      carrito: this.mapCart(data.carrito),
      estado: data.estado,
      total: Number(data.total),
      fechaPedido: data.fecha_pedido,
    };
  }

  async createOrder(cartId: number): Promise<Pedido> {
    const response = await httpClient.post('/pedidos/', {
      id_carrito: cartId,
    });
    return this.mapOrder(response.data);
  }

  async listOrders(limit?: number, offset?: number): Promise<PaginatedResult<Pedido>> {
    const response = await httpClient.get('/pedidos/', {
      params: { limit, offset },
    });
    return {
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
      results: response.data.results.map((item: any) => this.mapOrder(item)),
    };
  }

  async getOrder(id: number): Promise<Pedido> {
    const response = await httpClient.get(`/pedidos/${id}/`);
    return this.mapOrder(response.data);
  }

  async confirmOrder(id: number): Promise<Pedido> {
    const response = await httpClient.post(`/pedidos/${id}/confirm/`);
    return this.mapOrder(response.data);
  }
}
