// src/application/use-cases/seguro/get-seguro.use-case.ts
import type { SeguroRepository } from '../../../domain/ports/seguro.repository';
export class GetSeguroUseCase {
  constructor(private readonly repository: SeguroRepository) {}
  execute(id: number) { return this.repository.getSeguro(id); }
}
