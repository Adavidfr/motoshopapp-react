// src/application/use-cases/devolucion/get-devoluciones.use-case.ts
import type { DevolucionRepository, DevolucionFilters } from '../../../domain/ports/devolucion.repository';
export class GetDevolucionesUseCase {
  constructor(private readonly repository: DevolucionRepository) {}
  execute(filters?: DevolucionFilters) { return this.repository.listDevoluciones(filters); }
}
