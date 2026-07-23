// src/application/use-cases/venta/create-venta.use-case.ts
import type { VentaRepository } from '../../../domain/ports/venta.repository';
import type { Venta, VentaCreatePayload } from '../../../domain/entities/venta.entity';

export class CreateVentaUseCase {
  private ventaRepository: VentaRepository;

  constructor(ventaRepository: VentaRepository) {
    this.ventaRepository = ventaRepository;
  }

  execute(payload: VentaCreatePayload): Promise<Venta> {
    return this.ventaRepository.createVenta(payload);
  }
}
