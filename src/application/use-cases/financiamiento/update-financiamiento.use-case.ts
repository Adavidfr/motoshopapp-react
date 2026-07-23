// src/application/use-cases/financiamiento/update-financiamiento.use-case.ts
import type { FinanciamientoRepository } from '../../../domain/ports/financiamiento.repository';
import type { Financiamiento, FinanciamientoUpdatePayload } from '../../../domain/entities/financiamiento.entity';

export class UpdateFinanciamientoUseCase {
  private readonly repository: FinanciamientoRepository;

  constructor(repository: FinanciamientoRepository) {
    this.repository = repository;
  }

  execute(id: number, payload: FinanciamientoUpdatePayload): Promise<Financiamiento> {
    return this.repository.updateFinanciamiento(id, payload);
  }
}
