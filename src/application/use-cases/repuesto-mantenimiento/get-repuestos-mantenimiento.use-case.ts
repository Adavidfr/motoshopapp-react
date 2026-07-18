import type {
  PaginatedRepuestosMantenimiento,
} from '../../../domain/entities/repuesto-mantenimiento.entity';

import type {
  RepuestoMantenimientoFilters,
} from '../../dtos/repuesto-mantenimiento.dto';

import type {
  RepuestoMantenimientoRepository,
} from '../../../domain/ports/repuesto-mantenimiento.repository';

export class GetRepuestosMantenimientoUseCase {
  private readonly repository:
    RepuestoMantenimientoRepository;

  constructor(
    repository: RepuestoMantenimientoRepository,
  ) {
    this.repository = repository;
  }

  execute(
    filters?: RepuestoMantenimientoFilters,
  ): Promise<PaginatedRepuestosMantenimiento> {
    return this.repository.getAll(filters);
  }
}