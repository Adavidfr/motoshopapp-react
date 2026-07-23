// src/infrastructure/adapters/api-cart.repository.ts
import type { CartRepository, CartAddItemPayload } from '../../domain/ports/cart.repository';
import type { CarritoCompras, CarritoEstado, ItemCarrito } from '../../domain/entities/cart.entity';
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

export class ApiCartRepository implements CartRepository {
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

  async getActiveCart(): Promise<CarritoCompras> {
    try {
      const response = await httpClient.get<ApiCart>('/carritos/activo/');
      return this.mapCart(response.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 404) {
        const createResponse = await httpClient.post<ApiCart>('/carritos/', {});
        return this.mapCart(createResponse.data);
      }
      throw err;
    }
  }

  async addItem(cartId: number, payload: CartAddItemPayload): Promise<CarritoCompras> {
    const body: Record<string, number> = { cantidad: payload.cantidad };
    if (payload.id_moto !== undefined) body.id_moto = payload.id_moto;
    if (payload.id_repuesto !== undefined) body.id_repuesto = payload.id_repuesto;

    const response = await httpClient.post<ApiCart>(`/carritos/${cartId}/add-item/`, body);
    return this.mapCart(response.data);
  }

  async removeItem(cartId: number, itemId: number): Promise<void> {
    await httpClient.delete(`/carritos/${cartId}/remove-item/${itemId}/`);
  }

  async clearCart(cartId: number): Promise<CarritoCompras> {
    const response = await httpClient.post<ApiCart>(`/carritos/${cartId}/vaciar/`);
    return this.mapCart(response.data);
  }
}
