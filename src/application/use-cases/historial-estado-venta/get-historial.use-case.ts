// src/application/use-cases/historial-estado-venta/get-historial.use-case.ts
import type { HistorialEstadoVentaRepository } from '../../../domain/ports/historial-estado-venta.repository';
export class GetHistorialUseCase {
  private repository: HistorialEstadoVentaRepository;
  constructor(r: HistorialEstadoVentaRepository) { this.repository = r; }
  execute(id: number) { return this.repository.getHistorial(id); }
}
