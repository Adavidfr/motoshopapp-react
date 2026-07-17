// src/application/use-cases/movimiento-inventario/list-movimientos.use-case.ts
import type { MovimientoInventarioRepository } from '../../../domain/ports/movimiento-inventario.repository';
import type { MovimientoInventario } from '../../../domain/entities/movimiento-inventario.entity';

export class ListMovimientosUseCase {
  private inventoryRepository: MovimientoInventarioRepository;
  constructor(inventoryRepository: MovimientoInventarioRepository) {
    this.inventoryRepository = inventoryRepository;
  }

  async execute(): Promise<MovimientoInventario[]> {
    return this.inventoryRepository.listMovimientos();
  }
}
