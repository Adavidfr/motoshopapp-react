import type {
  CompraDto,
} from '../../dtos/compra.dto';

import type {
  CompraRepository,
} from '../../../domain/ports/compra.repository';

export class UpdateCompraUseCase {
  private readonly repository: CompraRepository;

  constructor(repository: CompraRepository) {
    this.repository = repository;
  }

  execute(
    id: number,
    dto: Partial<CompraDto>,
  ) {
    return this.repository.update(id, dto);
  }
}