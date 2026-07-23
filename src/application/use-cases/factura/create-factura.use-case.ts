// src/application/use-cases/factura/create-factura.use-case.ts
import type { FacturaRepository } from '../../../domain/ports/factura.repository';
import type { Factura, FacturaCreatePayload } from '../../../domain/entities/factura.entity';

export class CreateFacturaUseCase {
  private facturaRepository: FacturaRepository;

  constructor(facturaRepository: FacturaRepository) {
    this.facturaRepository = facturaRepository;
  }

  execute(payload: FacturaCreatePayload): Promise<Factura> {
    return this.facturaRepository.createFactura(payload);
  }
}
