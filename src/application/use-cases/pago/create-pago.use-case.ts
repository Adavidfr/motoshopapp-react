// src/application/use-cases/pago/create-pago.use-case.ts
import type { PagoRepository } from '../../../domain/ports/pago.repository';
import type { Pago, PagoCreatePayload } from '../../../domain/entities/pago.entity';

export class CreatePagoUseCase {
  private readonly repository: PagoRepository;

  constructor(repository: PagoRepository) {
    this.repository = repository;
  }

  execute(payload: PagoCreatePayload): Promise<Pago> {
    return this.repository.createPago(payload);
  }
}
