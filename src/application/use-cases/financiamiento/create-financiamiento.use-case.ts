// src/application/use-cases/financiamiento/create-financiamiento.use-case.ts
import type { FinanciamientoRepository } from '../../../domain/ports/financiamiento.repository';
import type { Financiamiento, FinanciamientoCreatePayload } from '../../../domain/entities/financiamiento.entity';

export class CreateFinanciamientoUseCase {
  private readonly repository: FinanciamientoRepository;

  constructor(repository: FinanciamientoRepository) {
    this.repository = repository;
  }

  execute(payload: FinanciamientoCreatePayload & { id_venta: number }): Promise<Financiamiento> {
    return this.repository.createFinanciamiento(payload);
  }
}
