// src/application/use-cases/devolucion/get-devolucion.use-case.ts
import type { DevolucionRepository } from '../../../domain/ports/devolucion.repository';
export class GetDevolucionUseCase {
  private repository: DevolucionRepository;
  constructor(r: DevolucionRepository) { this.repository = r; }
  execute(id: number) { return this.repository.getDevolucion(id); }
}
