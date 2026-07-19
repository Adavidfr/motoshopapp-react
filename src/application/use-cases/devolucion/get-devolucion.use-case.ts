// src/application/use-cases/devolucion/get-devolucion.use-case.ts
import type { DevolucionRepository } from '../../../domain/ports/devolucion.repository';
export class GetDevolucionUseCase {
  constructor(private readonly repository: DevolucionRepository) {}
  execute(id: number) { return this.repository.getDevolucion(id); }
}
