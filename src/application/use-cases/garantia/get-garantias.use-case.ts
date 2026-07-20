// src/application/use-cases/garantia/get-garantias.use-case.ts
import type { GarantiaRepository, GarantiaFilters } from '../../../domain/ports/garantia.repository';
export class GetGarantiasUseCase {
  constructor(private readonly repository: GarantiaRepository) {}
  execute(filters?: GarantiaFilters) { return this.repository.listGarantias(filters); }
}
