// src/infrastructure/adapters/api-cart.repository.ts
import type { CartRepository } from '../../domain/ports/cart.repository';
import type { CarritoCompras, ItemCarrito } from '../../domain/entities/cart.entity';
import { httpClient } from '../http/axios-client';

export class ApiCartRepository implements CartRepository {
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

  async getActiveCart(): Promise<CarritoCompras> {
    const response = await httpClient.get('/carritos/activo/');
    return this.mapCart(response.data);
  }

  async addItem(cartId: number, motoId: number, cantidad: number, precioUnitario: number): Promise<CarritoCompras> {
    const response = await httpClient.post(`/carritos/${cartId}/add-item/`, {
      id_moto: motoId,
      cantidad,
      precio_unitario: precioUnitario.toFixed(2),
    });
    return this.mapCart(response.data);
  }

  async removeItem(cartId: number, itemId: number): Promise<void> {
    await httpClient.delete(`/carritos/${cartId}/remove-item/${itemId}/`);
  }

  async clearCart(cartId: number): Promise<CarritoCompras> {
    const response = await httpClient.post(`/carritos/${cartId}/vaciar/`);
    return this.mapCart(response.data);
  }
}
