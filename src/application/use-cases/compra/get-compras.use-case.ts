import type {
  CompraFilters,
} from '../../dtos/compra.dto';

import type {
  CompraRepository,
} from '../../../domain/ports/compra.repository';

export class GetComprasUseCase {
  private readonly repository: CompraRepository;

  constructor(repository: CompraRepository) {
    this.repository = repository;
  }

  execute(filters?: CompraFilters) {
    return this.repository.getAll(filters);
  }
}