import type {
  CompraDto,
} from '../../dtos/compra.dto';

import type {
  CompraRepository,
} from '../../../domain/ports/compra.repository';

export class CreateCompraUseCase {
  private readonly repository: CompraRepository;

  constructor(repository: CompraRepository) {
    this.repository = repository;
  }

  execute(dto: CompraDto) {
    return this.repository.create(dto);
  }
}