// src/application/use-cases/factura/get-facturas.use-case.ts
import type { FacturaRepository, FacturaFilters } from '../../../domain/ports/factura.repository';
export class GetFacturasUseCase {
  constructor(private readonly repository: FacturaRepository) {}
  execute(filters?: FacturaFilters) { return this.repository.listFacturas(filters); }
}
