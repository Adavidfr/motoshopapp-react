// src/application/use-cases/factura/create-factura.use-case.ts
import type { FacturaRepository } from '../../../domain/ports/factura.repository';
import type { Factura } from '../../../domain/entities/factura.entity';
export class CreateFacturaUseCase {
  constructor(private readonly repository: FacturaRepository) {}
  execute(payload: Omit<Factura, 'id_factura' | 'fecha_emision'>) { return this.repository.createFactura(payload); }
}
