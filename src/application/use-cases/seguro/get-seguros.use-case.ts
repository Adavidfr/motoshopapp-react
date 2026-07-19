// src/application/use-cases/seguro/get-seguros.use-case.ts
import type { SeguroRepository, SeguroFilters } from '../../../domain/ports/seguro.repository';
export class GetSegurosUseCase {
  constructor(private readonly repository: SeguroRepository) {}
  execute(filters?: SeguroFilters) { return this.repository.listSeguros(filters); }
}
