// src/application/use-cases/seguro/get-seguros.use-case.ts
import type { SeguroRepository, SeguroFilters } from '../../../domain/ports/seguro.repository';
export class GetSegurosUseCase {
  private repository: SeguroRepository;
  constructor(r: SeguroRepository) { this.repository = r; }
  execute(filters?: SeguroFilters) { return this.repository.listSeguros(filters); }
}
