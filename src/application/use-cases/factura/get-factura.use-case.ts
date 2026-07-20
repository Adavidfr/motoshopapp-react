// src/application/use-cases/factura/get-factura.use-case.ts
import type { FacturaRepository } from '../../../domain/ports/factura.repository';
export class GetFacturaUseCase {
  constructor(private readonly repository: FacturaRepository) {}
  execute(id: number) { return this.repository.getFactura(id); }
}
