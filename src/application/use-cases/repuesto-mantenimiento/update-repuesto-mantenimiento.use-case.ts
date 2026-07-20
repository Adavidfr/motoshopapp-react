import type {
  RepuestoMantenimiento,
} from '../../../domain/entities/repuesto-mantenimiento.entity';

import type {
  RepuestoMantenimientoDto,
} from '../../dtos/repuesto-mantenimiento.dto';

import type {
  RepuestoMantenimientoRepository,
} from '../../../domain/ports/repuesto-mantenimiento.repository';

export class UpdateRepuestoMantenimientoUseCase {
  private readonly repository:
    RepuestoMantenimientoRepository;

  constructor(
    repository: RepuestoMantenimientoRepository,
  ) {
    this.repository = repository;
  }

  execute(
    id: number,
    dto: Partial<RepuestoMantenimientoDto>,
  ): Promise<RepuestoMantenimiento> {
    return this.repository.update(id, dto);
  }
}