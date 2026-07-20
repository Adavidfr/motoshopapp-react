// src/application/use-cases/pago/get-pago-stats.use-case.ts
import type { PagoRepository } from '../../../domain/ports/pago.repository';

export class GetPagoStatsUseCase {
  private readonly repository: PagoRepository;

  constructor(repository: PagoRepository) {
    this.repository = repository;
  }

  execute() {
    return this.repository.getStats();
  }
}
