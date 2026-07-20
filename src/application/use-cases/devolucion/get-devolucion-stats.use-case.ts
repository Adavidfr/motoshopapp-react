// src/application/use-cases/devolucion/get-devolucion-stats.use-case.ts
import type { DevolucionRepository } from '../../../domain/ports/devolucion.repository';
export class GetDevolucionStatsUseCase {
  private repository: DevolucionRepository;
  constructor(r: DevolucionRepository) { this.repository = r; }
  execute() { return this.repository.getStats(); }
}
