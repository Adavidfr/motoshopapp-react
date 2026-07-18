// src/application/use-cases/movimiento-inventario/create-movimiento.use-case.ts
import type { MovimientoInventarioRepository } from '../../../domain/ports/movimiento-inventario.repository';
import type { MovimientoInventario } from '../../../domain/entities/movimiento-inventario.entity';

export class CreateMovimientoUseCase {
  private inventoryRepository: MovimientoInventarioRepository;
  constructor(inventoryRepository: MovimientoInventarioRepository) {
    this.inventoryRepository = inventoryRepository;
  }

  async execute(payload: any): Promise<MovimientoInventario> {
    return this.inventoryRepository.createMovimiento(payload);
  }
}
