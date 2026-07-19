// src/application/use-cases/factura/delete-factura.use-case.ts
import type { FacturaRepository } from '../../../domain/ports/factura.repository';
export class DeleteFacturaUseCase {
  constructor(private readonly repository: FacturaRepository) {}
  execute(id: number) { return this.repository.deleteFactura(id); }
}
