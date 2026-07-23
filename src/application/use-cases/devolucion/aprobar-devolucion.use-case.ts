// src/application/use-cases/devolucion/aprobar-devolucion.use-case.ts
import type { DevolucionRepository } from '../../../domain/ports/devolucion.repository';
import type { Devolucion } from '../../../domain/entities/devolucion.entity';

export class AprobarDevolucionUseCase {
  private devolucionRepository: DevolucionRepository;

  constructor(devolucionRepository: DevolucionRepository) {
    this.devolucionRepository = devolucionRepository;
  }

  execute(id: number): Promise<Devolucion> {
    return this.devolucionRepository.aprobarDevolucion(id);
  }
}
