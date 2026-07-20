// src/application/use-cases/garantia/get-garantias.use-case.ts
import type { GarantiaRepository, GarantiaFilters } from '../../../domain/ports/garantia.repository';
export class GetGarantiasUseCase {
  private repository: GarantiaRepository;
  constructor(r: GarantiaRepository) { this.repository = r; }
  execute(filters?: GarantiaFilters) { return this.repository.listGarantias(filters); }
}
