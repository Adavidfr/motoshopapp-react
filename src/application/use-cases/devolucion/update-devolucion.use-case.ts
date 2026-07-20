// src/application/use-cases/devolucion/update-devolucion.use-case.ts
import type { DevolucionRepository } from '../../../domain/ports/devolucion.repository';
import type { Devolucion } from '../../../domain/entities/devolucion.entity';
export class UpdateDevolucionUseCase {
  private repository: DevolucionRepository;
  constructor(r: DevolucionRepository) { this.repository = r; }
  execute(id: number, payload: Partial<Devolucion>) { return this.repository.updateDevolucion(id, payload); }
}
