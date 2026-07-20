// src/application/use-cases/historial-estado-venta/get-historiales.use-case.ts
import type { HistorialEstadoVentaRepository, HistorialFilters } from '../../../domain/ports/historial-estado-venta.repository';
export class GetHistorialesUseCase {
  private repository: HistorialEstadoVentaRepository;
  constructor(r: HistorialEstadoVentaRepository) { this.repository = r; }
  execute(filters?: HistorialFilters) { return this.repository.listHistorial(filters); }
}
