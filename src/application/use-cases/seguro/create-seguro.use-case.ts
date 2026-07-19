// src/application/use-cases/seguro/create-seguro.use-case.ts
import type { SeguroRepository } from '../../../domain/ports/seguro.repository';
import type { Seguro } from '../../../domain/entities/seguro.entity';
export class CreateSeguroUseCase {
  constructor(private readonly repository: SeguroRepository) {}
  execute(payload: Omit<Seguro, 'id_seguro'>) { return this.repository.createSeguro(payload); }
}
