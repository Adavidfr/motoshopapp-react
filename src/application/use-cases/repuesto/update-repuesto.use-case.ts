// src/application/use-cases/repuesto/update-repuesto.use-case.ts
import type { RepuestoRepository } from '../../../domain/ports/repuesto.repository';
import type { Repuesto } from '../../../domain/entities/repuesto.entity';

export class UpdateRepuestoUseCase {
  private repuestoRepository: RepuestoRepository;
  constructor(repuestoRepository: RepuestoRepository) {
    this.repuestoRepository = repuestoRepository;
  }

  async execute(id: number, formData: FormData): Promise<Repuesto> {
    return this.repuestoRepository.updateRepuesto(id, formData);
  }
}
