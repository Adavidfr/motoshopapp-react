// src/application/use-cases/garantia/delete-garantia.use-case.ts
import type { GarantiaRepository } from '../../../domain/ports/garantia.repository';
export class DeleteGarantiaUseCase {
  private repository: GarantiaRepository;
  constructor(r: GarantiaRepository) { this.repository = r; }
  execute(id: number) { return this.repository.deleteGarantia(id); }
}
