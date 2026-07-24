// src/application/use-cases/seguro/update-seguro.use-case.ts
import type { SeguroRepository } from '../../../domain/ports/seguro.repository';
import type { Seguro, SeguroUpdatePayload } from '../../../domain/entities/seguro.entity';

export class UpdateSeguroUseCase {
  private repository: SeguroRepository;

  constructor(repository: SeguroRepository) {
    this.repository = repository;
  }

  execute(id: number, payload: SeguroUpdatePayload): Promise<Seguro> {
    return this.repository.updateSeguro(id, payload);
  }
}
