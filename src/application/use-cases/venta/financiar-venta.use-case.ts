// src/application/use-cases/venta/financiar-venta.use-case.ts
import type { VentaRepository } from '../../../domain/ports/venta.repository';
import type { Financiamiento, FinanciamientoCreatePayload } from '../../../domain/entities/financiamiento.entity';

export class FinanciarVentaUseCase {
  private readonly repository: VentaRepository;

  constructor(repository: VentaRepository) {
    this.repository = repository;
  }

  execute(id: number, payload: FinanciamientoCreatePayload): Promise<Financiamiento> {
    return this.repository.financiarVenta(id, payload);
  }
}
