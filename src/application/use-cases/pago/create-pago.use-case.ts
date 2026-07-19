// src/application/use-cases/pago/create-pago.use-case.ts
import type { PagoRepository } from '../../../domain/ports/pago.repository';
import type { Pago } from '../../../domain/entities/pago.entity';

export class CreatePagoUseCase {
  private readonly repository: PagoRepository;

  constructor(repository: PagoRepository) {
    this.repository = repository;
  }

  execute(payload: Omit<Pago, 'id_pago' | 'fecha_pago'>) {
    return this.repository.createPago(payload);
  }
}
