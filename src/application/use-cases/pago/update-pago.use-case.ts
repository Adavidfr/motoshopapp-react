// src/application/use-cases/pago/update-pago.use-case.ts
import type { PagoRepository } from '../../../domain/ports/pago.repository';
import type { Pago } from '../../../domain/entities/pago.entity';

export class UpdatePagoUseCase {
  private readonly repository: PagoRepository;

  constructor(repository: PagoRepository) {
    this.repository = repository;
  }

  execute(id: number, payload: Partial<Pago>) {
    return this.repository.updatePago(id, payload);
  }
}
