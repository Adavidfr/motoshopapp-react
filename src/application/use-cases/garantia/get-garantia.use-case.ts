// src/application/use-cases/garantia/get-garantia.use-case.ts
import type { GarantiaRepository } from '../../../domain/ports/garantia.repository';
export class GetGarantiaUseCase {
  private repository: GarantiaRepository;
  constructor(r: GarantiaRepository) { this.repository = r; }
  execute(id: number) { return this.repository.getGarantia(id); }
}
