// src/application/use-cases/historial-estado-venta/create-historial.use-case.ts
import type { HistorialEstadoVentaRepository } from '../../../domain/ports/historial-estado-venta.repository';
import type { HistorialEstadoVenta } from '../../../domain/entities/historial-estado-venta.entity';
export class CreateHistorialUseCase {
  private repository: HistorialEstadoVentaRepository;
  constructor(r: HistorialEstadoVentaRepository) { this.repository = r; }
  execute(payload: Omit<HistorialEstadoVenta, 'id_historial' | 'fecha_cambio'>) { return this.repository.createHistorial(payload); }
}
