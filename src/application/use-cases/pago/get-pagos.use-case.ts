// src/application/use-cases/pago/get-pagos.use-case.ts
import type { PagoRepository, PagoFilters } from '../../../domain/ports/pago.repository';

export class GetPagosUseCase {
  private readonly repository: PagoRepository;

  constructor(repository: PagoRepository) {
    this.repository = repository;
  }

  execute(filters?: PagoFilters) {
    return this.repository.listPagos(filters);
  }
}
