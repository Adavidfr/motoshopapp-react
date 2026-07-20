// src/application/use-cases/historial-estado-venta/update-historial.use-case.ts
import type { HistorialEstadoVentaRepository } from '../../../domain/ports/historial-estado-venta.repository';
import type { HistorialEstadoVenta } from '../../../domain/entities/historial-estado-venta.entity';
export class UpdateHistorialUseCase {
  private repository: HistorialEstadoVentaRepository;
  constructor(r: HistorialEstadoVentaRepository) { this.repository = r; }
  execute(id: number, payload: Partial<HistorialEstadoVenta>) { return this.repository.updateHistorial(id, payload); }
}
