// src/application/use-cases/factura/get-factura.use-case.ts
import type { FacturaRepository } from '../../../domain/ports/factura.repository';
export class GetFacturaUseCase {
  private repository: FacturaRepository;
  constructor(r: FacturaRepository) { this.repository = r; }
  execute(id: number) { return this.repository.getFactura(id); }
}
