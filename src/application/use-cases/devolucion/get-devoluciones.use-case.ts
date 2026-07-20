// src/application/use-cases/devolucion/get-devoluciones.use-case.ts
import type { DevolucionRepository, DevolucionFilters } from '../../../domain/ports/devolucion.repository';
export class GetDevolucionesUseCase {
  private repository: DevolucionRepository;
  constructor(r: DevolucionRepository) { this.repository = r; }
  execute(filters?: DevolucionFilters) { return this.repository.listDevoluciones(filters); }
}
