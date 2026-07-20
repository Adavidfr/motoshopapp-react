// src/application/use-cases/venta/get-venta.use-case.ts
import type { VentaRepository } from '../../../domain/ports/venta.repository';

export class GetVentaUseCase {
  private readonly repository: VentaRepository;

  constructor(repository: VentaRepository) {
    this.repository = repository;
  }

  execute(id: number) {
    return this.repository.getVenta(id);
  }
}
