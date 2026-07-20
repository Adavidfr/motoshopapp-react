import type {
  CompraRepository,
} from '../../../domain/ports/compra.repository';

export class GetCompraStatsUseCase {
  private readonly repository: CompraRepository;

  constructor(repository: CompraRepository) {
    this.repository = repository;
  }

  execute() {
    return this.repository.getStats();
  }
}