// src/application/use-cases/financiamiento/get-financiamiento-stats.use-case.ts
import type { FinanciamientoRepository } from '../../../domain/ports/financiamiento.repository';

export class GetFinanciamientoStatsUseCase {
  private readonly repository: FinanciamientoRepository;

  constructor(repository: FinanciamientoRepository) {
    this.repository = repository;
  }

  execute() {
    return this.repository.getStats();
  }
}
