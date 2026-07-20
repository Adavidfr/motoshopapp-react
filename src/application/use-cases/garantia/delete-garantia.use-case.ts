// src/application/use-cases/garantia/delete-garantia.use-case.ts
import type { GarantiaRepository } from '../../../domain/ports/garantia.repository';
export class DeleteGarantiaUseCase {
  constructor(private readonly repository: GarantiaRepository) {}
  execute(id: number) { return this.repository.deleteGarantia(id); }
}
