// src/application/use-cases/devolucion/create-devolucion.use-case.ts
import type { DevolucionRepository } from '../../../domain/ports/devolucion.repository';
import type { Devolucion } from '../../../domain/entities/devolucion.entity';
export class CreateDevolucionUseCase {
  constructor(private readonly repository: DevolucionRepository) {}
  execute(payload: Omit<Devolucion, 'id_devolucion' | 'fecha_solicitud' | 'fecha_resolucion'>) { return this.repository.createDevolucion(payload); }
}
