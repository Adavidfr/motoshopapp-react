// src/application/use-cases/venta/get-venta-resumen.use-case.ts
import type { VentaRepository } from '../../../domain/ports/venta.repository';
import type { VentaResumen } from '../../../domain/entities/venta.entity';

export class GetVentaResumenUseCase {
  private ventaRepository: VentaRepository;

  constructor(ventaRepository: VentaRepository) {
    this.ventaRepository = ventaRepository;
  }

  execute(id: number): Promise<VentaResumen> {
    return this.ventaRepository.getResumen(id);
  }
}
