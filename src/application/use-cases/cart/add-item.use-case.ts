// src/application/use-cases/cart/add-item.use-case.ts
import type { CartRepository } from '../../../domain/ports/cart.repository';
import type { CarritoCompras } from '../../../domain/entities/cart.entity';

export class AddItemToCartUseCase {
  private cartRepository: CartRepository;
  constructor(cartRepository: CartRepository) {
    this.cartRepository = cartRepository;
  }

  async execute(
    cartId: number,
    motoId: number | null,
    repuestoId: number | null,
    cantidad: number,
  ): Promise<CarritoCompras> {
    const payload: { cantidad: number; id_moto?: number; id_repuesto?: number } = { cantidad };
    if (motoId !== null) payload.id_moto = motoId;
    if (repuestoId !== null) payload.id_repuesto = repuestoId;
    return this.cartRepository.addItem(cartId, payload);
  }
}
