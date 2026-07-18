// src/application/use-cases/venta/create-venta.use-case.ts
import type { VentaRepository } from '../../../domain/ports/venta.repository';

export class CreateVentaUseCase {
  private readonly repository: VentaRepository;

  constructor(repository: VentaRepository) {
    this.repository = repository;
  }

  execute(payload: { id_pedido: number; total_venta: string; estado: string }) {
    return this.repository.createVenta(payload);
  }
}
