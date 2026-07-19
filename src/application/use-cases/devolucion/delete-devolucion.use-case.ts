// src/application/use-cases/devolucion/delete-devolucion.use-case.ts
import type { DevolucionRepository } from '../../../domain/ports/devolucion.repository';
export class DeleteDevolucionUseCase {
  constructor(private readonly repository: DevolucionRepository) {}
  execute(id: number) { return this.repository.deleteDevolucion(id); }
}
