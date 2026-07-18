import type {
  Mantenimiento,
} from '../../../domain/entities/mantenimiento.entity';

import type {
  MantenimientoRepository,
} from '../../../domain/ports/mantenimiento.repository';

export class GetMantenimientoUseCase {
  private readonly repository:
    MantenimientoRepository;

  constructor(
    repository: MantenimientoRepository,
  ) {
    this.repository = repository;
  }

  execute(
    id: number,
  ): Promise<Mantenimiento> {
    return this.repository.getById(id);
  }
}