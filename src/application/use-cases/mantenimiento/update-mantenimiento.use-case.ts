import type {
  Mantenimiento,
} from '../../../domain/entities/mantenimiento.entity';

import type {
  MantenimientoDto,
} from '../../dtos/mantenimiento.dto';

import type {
  MantenimientoRepository,
} from '../../../domain/ports/mantenimiento.repository';

export class UpdateMantenimientoUseCase {
  private readonly repository:
    MantenimientoRepository;

  constructor(
    repository: MantenimientoRepository,
  ) {
    this.repository = repository;
  }

  execute(
    id: number,
    dto: Partial<MantenimientoDto>,
  ): Promise<Mantenimiento> {
    return this.repository.update(
      id,
      dto,
    );
  }
}