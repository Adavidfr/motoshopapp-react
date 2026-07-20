// src/application/use-cases/devolucion/update-devolucion.use-case.ts
import type { DevolucionRepository } from '../../../domain/ports/devolucion.repository';
import type { Devolucion } from '../../../domain/entities/devolucion.entity';
export class UpdateDevolucionUseCase {
  constructor(private readonly repository: DevolucionRepository) {}
  execute(id: number, payload: Partial<Devolucion>) { return this.repository.updateDevolucion(id, payload); }
}
