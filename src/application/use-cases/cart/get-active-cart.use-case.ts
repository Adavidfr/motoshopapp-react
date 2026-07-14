// src/application/use-cases/cart/get-active-cart.use-case.ts
import type { CartRepository } from '../../../domain/ports/cart.repository';
import type { CarritoCompras } from '../../../domain/entities/cart.entity';

export class GetActiveCartUseCase {
  private cartRepository: CartRepository;
  constructor(cartRepository: CartRepository) {
    this.cartRepository = cartRepository;
  }

  async execute(): Promise<CarritoCompras> {
    return this.cartRepository.getActiveCart();
  }
}
