// src/application/use-cases/garantia/create-garantia.use-case.ts
import type { GarantiaRepository } from '../../../domain/ports/garantia.repository';
import type { Garantia } from '../../../domain/entities/garantia.entity';
export class CreateGarantiaUseCase {
  private repository: GarantiaRepository;
  constructor(r: GarantiaRepository) { this.repository = r; }
  execute(payload: Omit<Garantia, 'id_garantia'>) { return this.repository.createGarantia(payload); }
}
