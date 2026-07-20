// src/application/use-cases/financiamiento/get-financiamiento.use-case.ts
import type { FinanciamientoRepository } from '../../../domain/ports/financiamiento.repository';

export class GetFinanciamientoUseCase {
  private readonly repository: FinanciamientoRepository;

  constructor(repository: FinanciamientoRepository) {
    this.repository = repository;
  }

  execute(id: number) {
    return this.repository.getFinanciamiento(id);
  }
}
