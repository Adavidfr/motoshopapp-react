import type {
  RepuestoMantenimiento,
} from '../../../domain/entities/repuesto-mantenimiento.entity';

import type {
  RepuestoMantenimientoRepository,
} from '../../../domain/ports/repuesto-mantenimiento.repository';

export class GetRepuestoMantenimientoUseCase {
  private readonly repository:
    RepuestoMantenimientoRepository;

  constructor(
    repository: RepuestoMantenimientoRepository,
  ) {
    this.repository = repository;
  }

  execute(
    id: number,
  ): Promise<RepuestoMantenimiento> {
    return this.repository.getById(id);
  }
}