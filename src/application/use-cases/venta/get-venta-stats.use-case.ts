// src/application/use-cases/venta/get-venta-stats.use-case.ts
import type { VentaRepository } from '../../../domain/ports/venta.repository';

export class GetVentaStatsUseCase {
  private readonly repository: VentaRepository;

  constructor(repository: VentaRepository) {
    this.repository = repository;
  }

  execute() {
    return this.repository.getStats();
  }
}
