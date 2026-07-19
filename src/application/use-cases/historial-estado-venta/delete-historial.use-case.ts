// src/application/use-cases/historial-estado-venta/delete-historial.use-case.ts
import type { HistorialEstadoVentaRepository } from '../../../domain/ports/historial-estado-venta.repository';
export class DeleteHistorialUseCase {
  constructor(private readonly repository: HistorialEstadoVentaRepository) {}
  execute(id: number) { return this.repository.deleteHistorial(id); }
}
