// src/application/use-cases/factura/create-factura.use-case.ts
import type { FacturaRepository } from '../../../domain/ports/factura.repository';
import type { Factura } from '../../../domain/entities/factura.entity';
export class CreateFacturaUseCase {
  private repository: FacturaRepository;
  constructor(r: FacturaRepository) { this.repository = r; }
  execute(payload: Omit<Factura, 'id_factura' | 'fecha_emision'>) { return this.repository.createFactura(payload); }
}
