// src/application/use-cases/repuesto/list-repuestos.use-case.ts
import type { RepuestoRepository, ListRepuestosParams } from '../../../domain/ports/repuesto.repository';
import type { Repuesto } from '../../../domain/entities/repuesto.entity';

export class ListRepuestosUseCase {
  private repuestoRepository: RepuestoRepository;
  constructor(repuestoRepository: RepuestoRepository) {
    this.repuestoRepository = repuestoRepository;
  }

  async execute(params?: ListRepuestosParams): Promise<Repuesto[]> {
    return this.repuestoRepository.listRepuestos(params);
  }
}
