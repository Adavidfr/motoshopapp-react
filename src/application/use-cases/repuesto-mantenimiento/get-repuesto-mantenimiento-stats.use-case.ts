import type {
  RepuestoMantenimientoStats,
} from '../../../domain/entities/repuesto-mantenimiento.entity';

import type {
  RepuestoMantenimientoRepository,
} from '../../../domain/ports/repuesto-mantenimiento.repository';

export class GetRepuestoMantenimientoStatsUseCase {
  private readonly repository:
    RepuestoMantenimientoRepository;

  constructor(
    repository: RepuestoMantenimientoRepository,
  ) {
    this.repository = repository;
  }

  execute(): Promise<RepuestoMantenimientoStats> {
    return this.repository.getStats();
  }
}