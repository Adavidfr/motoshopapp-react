// src/application/use-cases/financiamiento/create-financiamiento.use-case.ts
import type { FinanciamientoRepository } from '../../../domain/ports/financiamiento.repository';
import type { Financiamiento } from '../../../domain/entities/financiamiento.entity';

export class CreateFinanciamientoUseCase {
  private readonly repository: FinanciamientoRepository;

  constructor(repository: FinanciamientoRepository) {
    this.repository = repository;
  }

  execute(payload: Omit<Financiamiento, 'id_financiamiento'>) {
    return this.repository.createFinanciamiento(payload);
  }
}
