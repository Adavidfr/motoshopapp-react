// src/application/use-cases/financiamiento/get-financiamientos.use-case.ts
import type { FinanciamientoRepository, FinanciamientoFilters } from '../../../domain/ports/financiamiento.repository';

export class GetFinanciamientosUseCase {
  private readonly repository: FinanciamientoRepository;

  constructor(repository: FinanciamientoRepository) {
    this.repository = repository;
  }

  execute(filters?: FinanciamientoFilters) {
    return this.repository.listFinanciamientos(filters);
  }
}
