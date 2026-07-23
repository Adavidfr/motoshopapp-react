// src/application/use-cases/repuesto/get-repuesto.use-case.ts
import type { RepuestoRepository } from '../../../domain/ports/repuesto.repository';
import type { Repuesto } from '../../../domain/entities/repuesto.entity';

export class GetRepuestoUseCase {
  private repuestoRepository: RepuestoRepository;
  constructor(repuestoRepository: RepuestoRepository) {
    this.repuestoRepository = repuestoRepository;
  }

  async execute(id: number): Promise<Repuesto> {
    return this.repuestoRepository.getRepuesto(id);
  }
}
