// src/application/use-cases/pago/get-pago.use-case.ts
import type { PagoRepository } from '../../../domain/ports/pago.repository';

export class GetPagoUseCase {
  private readonly repository: PagoRepository;

  constructor(repository: PagoRepository) {
    this.repository = repository;
  }

  execute(id: number) {
    return this.repository.getPago(id);
  }
}
