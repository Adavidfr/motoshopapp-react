// src/application/use-cases/cart/clear-cart.use-case.ts
import type { CartRepository } from '../../../domain/ports/cart.repository';
import type { CarritoCompras } from '../../../domain/entities/cart.entity';

export class ClearCartUseCase {
  private cartRepository: CartRepository;
  constructor(cartRepository: CartRepository) {
    this.cartRepository = cartRepository;
  }

  async execute(cartId: number): Promise<CarritoCompras> {
    return this.cartRepository.clearCart(cartId);
  }
}
