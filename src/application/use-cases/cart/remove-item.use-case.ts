// src/application/use-cases/cart/remove-item.use-case.ts
import type { CartRepository } from '../../../domain/ports/cart.repository';

export class RemoveItemFromCartUseCase {
  private cartRepository: CartRepository;
  constructor(cartRepository: CartRepository) {
    this.cartRepository = cartRepository;
  }

  async execute(cartId: number, itemId: number): Promise<void> {
    return this.cartRepository.removeItem(cartId, itemId);
  }
}
