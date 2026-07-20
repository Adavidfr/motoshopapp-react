// src/application/use-cases/repuesto/delete-repuesto.use-case.ts
import type { RepuestoRepository } from '../../../domain/ports/repuesto.repository';

export class DeleteRepuestoUseCase {
  private repuestoRepository: RepuestoRepository;
  constructor(repuestoRepository: RepuestoRepository) {
    this.repuestoRepository = repuestoRepository;
  }

  async execute(id: number): Promise<void> {
    return this.repuestoRepository.deleteRepuesto(id);
  }
}
