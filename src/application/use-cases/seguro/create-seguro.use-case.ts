// src/application/use-cases/seguro/create-seguro.use-case.ts
import type { SeguroRepository } from '../../../domain/ports/seguro.repository';
import type { Seguro, SeguroCreatePayload } from '../../../domain/entities/seguro.entity';

export class CreateSeguroUseCase {
  private repository: SeguroRepository;

  constructor(repository: SeguroRepository) {
    this.repository = repository;
  }

  execute(payload: SeguroCreatePayload): Promise<Seguro> {
    return this.repository.createSeguro(payload);
  }
}
