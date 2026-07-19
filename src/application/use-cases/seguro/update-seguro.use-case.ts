// src/application/use-cases/seguro/update-seguro.use-case.ts
import type { SeguroRepository } from '../../../domain/ports/seguro.repository';
import type { Seguro } from '../../../domain/entities/seguro.entity';
export class UpdateSeguroUseCase {
  constructor(private readonly repository: SeguroRepository) {}
  execute(id: number, payload: Partial<Seguro>) { return this.repository.updateSeguro(id, payload); }
}
