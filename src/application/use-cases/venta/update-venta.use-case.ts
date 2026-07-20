// src/application/use-cases/venta/update-venta.use-case.ts
import type { VentaRepository } from '../../../domain/ports/venta.repository';
import type { Venta } from '../../../domain/entities/venta.entity';

export class UpdateVentaUseCase {
  private readonly repository: VentaRepository;

  constructor(repository: VentaRepository) {
    this.repository = repository;
  }

  execute(id: number, payload: Partial<Venta>) {
    return this.repository.updateVenta(id, payload);
  }
}
