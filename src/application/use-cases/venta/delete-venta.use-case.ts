// src/application/use-cases/venta/delete-venta.use-case.ts
import type { VentaRepository } from '../../../domain/ports/venta.repository';

export class DeleteVentaUseCase {
  private readonly repository: VentaRepository;

  constructor(repository: VentaRepository) {
    this.repository = repository;
  }

  execute(id: number) {
    return this.repository.deleteVenta(id);
  }
}
