import type {
  CompraRepository,
} from '../../../domain/ports/compra.repository';

export class DeleteCompraUseCase {
  private readonly repository: CompraRepository;

  constructor(repository: CompraRepository) {
    this.repository = repository;
  }

  execute(id: number) {
    return this.repository.delete(id);
  }
}