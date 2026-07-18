// src/application/use-cases/venta/get-ventas.use-case.ts
import type { VentaRepository, VentaFilters } from '../../../domain/ports/venta.repository';

export class GetVentasUseCase {
  private readonly repository: VentaRepository;

  constructor(repository: VentaRepository) {
    this.repository = repository;
  }

  execute(filters?: VentaFilters) {
    return this.repository.listVentas(filters);
  }
}
