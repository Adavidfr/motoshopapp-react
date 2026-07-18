import type {
  Mantenimiento,
} from '../../../domain/entities/mantenimiento.entity';

import type {
  MantenimientoDto,
} from '../../dtos/mantenimiento.dto';

import type {
  MantenimientoRepository,
} from '../../../domain/ports/mantenimiento.repository';

export class CreateMantenimientoUseCase {
  private readonly repository:
    MantenimientoRepository;

  constructor(
    repository: MantenimientoRepository,
  ) {
    this.repository = repository;
  }

  execute(
    dto: MantenimientoDto,
  ): Promise<Mantenimiento> {
    return this.repository.create(dto);
  }
}