// src/domain/ports/cart.repository.ts
import type { CarritoCompras } from '../entities/cart.entity';

export interface CartAddItemPayload {
  id_moto?: number;
  id_repuesto?: number;
  cantidad: number;
}

export interface CartRepository {
  getActiveCart(): Promise<CarritoCompras>;
  addItem(cartId: number, payload: CartAddItemPayload): Promise<CarritoCompras>;
  removeItem(cartId: number, itemId: number): Promise<void>;
  clearCart(cartId: number): Promise<CarritoCompras>;
}
