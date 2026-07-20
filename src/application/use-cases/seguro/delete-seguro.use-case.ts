// src/application/use-cases/seguro/delete-seguro.use-case.ts
import type { SeguroRepository } from '../../../domain/ports/seguro.repository';
export class DeleteSeguroUseCase {
  private repository: SeguroRepository;
  constructor(r: SeguroRepository) { this.repository = r; }
  execute(id: number) { return this.repository.deleteSeguro(id); }
}
