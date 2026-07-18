// src/application/use-cases/venta/financiar-venta.use-case.ts
import type { VentaRepository } from '../../../domain/ports/venta.repository';
import type { Financiamiento } from '../../../domain/entities/financiamiento.entity';

export class FinanciarVentaUseCase {
  private readonly repository: VentaRepository;

  constructor(repository: VentaRepository) {
    this.repository = repository;
  }

  execute(id: number, payload: Omit<Financiamiento, 'id_financiamiento' | 'id_venta'>) {
    return this.repository.financiarVenta(id, payload);
  }
}
