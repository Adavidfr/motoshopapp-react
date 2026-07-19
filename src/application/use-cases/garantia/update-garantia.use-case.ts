// src/application/use-cases/garantia/update-garantia.use-case.ts
import type { GarantiaRepository } from '../../../domain/ports/garantia.repository';
import type { Garantia } from '../../../domain/entities/garantia.entity';
export class UpdateGarantiaUseCase {
  constructor(private readonly repository: GarantiaRepository) {}
  execute(id: number, payload: Partial<Garantia>) { return this.repository.updateGarantia(id, payload); }
}
