import type { CompraRepository } from '../../../domain/ports/compra.repository';
import type { Compra } from '../../../domain/entities/compra.entity';

export class RecibirCompraUseCase {
  private readonly repository: CompraRepository;

  constructor(repository: CompraRepository) {
    this.repository = repository;
  }

  execute(id: number): Promise<Compra> {
    return this.repository.recibir(id);
  }
}
