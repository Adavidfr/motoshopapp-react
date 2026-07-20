// src/application/use-cases/devolucion/delete-devolucion.use-case.ts
import type { DevolucionRepository } from '../../../domain/ports/devolucion.repository';
export class DeleteDevolucionUseCase {
  private repository: DevolucionRepository;
  constructor(r: DevolucionRepository) { this.repository = r; }
  execute(id: number) { return this.repository.deleteDevolucion(id); }
}
