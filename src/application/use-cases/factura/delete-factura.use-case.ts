// src/application/use-cases/factura/delete-factura.use-case.ts
import type { FacturaRepository } from '../../../domain/ports/factura.repository';
export class DeleteFacturaUseCase {
  private repository: FacturaRepository;
  constructor(r: FacturaRepository) { this.repository = r; }
  execute(id: number) { return this.repository.deleteFactura(id); }
}
