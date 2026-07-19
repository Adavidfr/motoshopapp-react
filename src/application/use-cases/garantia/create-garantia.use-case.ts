// src/application/use-cases/garantia/create-garantia.use-case.ts
import type { GarantiaRepository } from '../../../domain/ports/garantia.repository';
import type { Garantia } from '../../../domain/entities/garantia.entity';
export class CreateGarantiaUseCase {
  constructor(private readonly repository: GarantiaRepository) {}
  execute(payload: Omit<Garantia, 'id_garantia'>) { return this.repository.createGarantia(payload); }
}
