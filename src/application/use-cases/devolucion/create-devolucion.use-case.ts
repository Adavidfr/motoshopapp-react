// src/application/use-cases/devolucion/create-devolucion.use-case.ts
import type { DevolucionRepository } from '../../../domain/ports/devolucion.repository';
import type { Devolucion, DevolucionCreatePayload } from '../../../domain/entities/devolucion.entity';

export class CreateDevolucionUseCase {
  private devolucionRepository: DevolucionRepository;

  constructor(devolucionRepository: DevolucionRepository) {
    this.devolucionRepository = devolucionRepository;
  }

  execute(payload: DevolucionCreatePayload): Promise<Devolucion> {
    return this.devolucionRepository.createDevolucion(payload);
  }
}
