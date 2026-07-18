// src/application/use-cases/repuesto/create-repuesto.use-case.ts
import type { RepuestoRepository } from '../../../domain/ports/repuesto.repository';
import type { Repuesto } from '../../../domain/entities/repuesto.entity';

export class CreateRepuestoUseCase {
  private repuestoRepository: RepuestoRepository;
  constructor(repuestoRepository: RepuestoRepository) {
    this.repuestoRepository = repuestoRepository;
  }

  async execute(formData: FormData): Promise<Repuesto> {
    return this.repuestoRepository.createRepuesto(formData);
  }
}
