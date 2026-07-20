// src/application/use-cases/historial-estado-venta/get-historiales.use-case.ts
import type { HistorialEstadoVentaRepository, HistorialFilters } from '../../../domain/ports/historial-estado-venta.repository';
export class GetHistorialesUseCase {
  constructor(private readonly repository: HistorialEstadoVentaRepository) {}
  execute(filters?: HistorialFilters) { return this.repository.listHistorial(filters); }
}
