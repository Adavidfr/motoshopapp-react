import type {
  PaginatedMantenimientos,
} from '../../../domain/entities/mantenimiento.entity';

import type {
  MantenimientoFilters,
} from '../../dtos/mantenimiento.dto';

import type {
  MantenimientoRepository,
} from '../../../domain/ports/mantenimiento.repository';

export class GetMantenimientosUseCase {
  private readonly repository:
    MantenimientoRepository;

  constructor(
    repository: MantenimientoRepository,
  ) {
    this.repository = repository;
  }

  execute(
    filters?: MantenimientoFilters,
  ): Promise<PaginatedMantenimientos> {
    return this.repository.getAll(filters);
  }
}