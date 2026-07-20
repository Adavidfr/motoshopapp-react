// src/application/use-cases/factura/update-factura.use-case.ts
import type { FacturaRepository } from '../../../domain/ports/factura.repository';
import type { Factura } from '../../../domain/entities/factura.entity';
export class UpdateFacturaUseCase {
  private repository: FacturaRepository;
  constructor(r: FacturaRepository) { this.repository = r; }
  execute(id: number, payload: Partial<Factura>) { return this.repository.updateFactura(id, payload); }
}
