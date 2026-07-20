// src/application/use-cases/financiamiento/delete-financiamiento.use-case.ts
import type { FinanciamientoRepository } from '../../../domain/ports/financiamiento.repository';

export class DeleteFinanciamientoUseCase {
  private readonly repository: FinanciamientoRepository;

  constructor(repository: FinanciamientoRepository) {
    this.repository = repository;
  }

  execute(id: number) {
    return this.repository.deleteFinanciamiento(id);
  }
}
