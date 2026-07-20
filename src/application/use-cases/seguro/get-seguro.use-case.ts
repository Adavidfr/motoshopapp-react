// src/application/use-cases/seguro/get-seguro.use-case.ts
import type { SeguroRepository } from '../../../domain/ports/seguro.repository';
export class GetSeguroUseCase {
  private repository: SeguroRepository;
  constructor(r: SeguroRepository) { this.repository = r; }
  execute(id: number) { return this.repository.getSeguro(id); }
}
