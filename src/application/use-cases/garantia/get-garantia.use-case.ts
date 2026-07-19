// src/application/use-cases/garantia/get-garantia.use-case.ts
import type { GarantiaRepository } from '../../../domain/ports/garantia.repository';
export class GetGarantiaUseCase {
  constructor(private readonly repository: GarantiaRepository) {}
  execute(id: number) { return this.repository.getGarantia(id); }
}
