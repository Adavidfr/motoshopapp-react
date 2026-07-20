// src/application/use-cases/devolucion/get-devolucion-stats.use-case.ts
import type { DevolucionRepository } from '../../../domain/ports/devolucion.repository';
export class GetDevolucionStatsUseCase {
  constructor(private readonly repository: DevolucionRepository) {}
  execute() { return this.repository.getStats(); }
}
