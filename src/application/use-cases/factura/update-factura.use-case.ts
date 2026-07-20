// src/application/use-cases/factura/update-factura.use-case.ts
import type { FacturaRepository } from '../../../domain/ports/factura.repository';
import type { Factura } from '../../../domain/entities/factura.entity';
export class UpdateFacturaUseCase {
  constructor(private readonly repository: FacturaRepository) {}
  execute(id: number, payload: Partial<Factura>) { return this.repository.updateFactura(id, payload); }
}
