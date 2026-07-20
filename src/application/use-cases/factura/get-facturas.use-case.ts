// src/application/use-cases/factura/get-facturas.use-case.ts
import type { FacturaRepository, FacturaFilters } from '../../../domain/ports/factura.repository';
export class GetFacturasUseCase {
  private repository: FacturaRepository;
  constructor(r: FacturaRepository) { this.repository = r; }
  execute(filters?: FacturaFilters) { return this.repository.listFacturas(filters); }
}
