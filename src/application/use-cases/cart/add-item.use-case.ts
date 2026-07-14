// src/application/use-cases/cart/add-item.use-case.ts
import type { CartRepository } from '../../../domain/ports/cart.repository';
import type { CarritoCompras } from '../../../domain/entities/cart.entity';

export class AddItemToCartUseCase {
  private cartRepository: CartRepository;
  constructor(cartRepository: CartRepository) {
    this.cartRepository = cartRepository;
  }

  async execute(cartId: number, motoId: number, cantidad: number, precioUnitario: number): Promise<CarritoCompras> {
    return this.cartRepository.addItem(cartId, motoId, cantidad, precioUnitario);
  }
}
