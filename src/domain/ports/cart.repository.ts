// src/domain/ports/cart.repository.ts
import type { CarritoCompras } from '../entities/cart.entity';

export interface CartRepository {
  getActiveCart(): Promise<CarritoCompras>;
  addItem(cartId: number, motoId: number, cantidad: number, precioUnitario: number): Promise<CarritoCompras>;
  removeItem(cartId: number, itemId: number): Promise<void>;
  clearCart(cartId: number): Promise<CarritoCompras>;
}
