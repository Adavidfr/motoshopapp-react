import type {
  MantenimientoStats,
} from '../../../domain/entities/mantenimiento.entity';

import type {
  MantenimientoRepository,
} from '../../../domain/ports/mantenimiento.repository';

export class GetMantenimientoStatsUseCase {
  private readonly repository:
    MantenimientoRepository;

  constructor(
    repository: MantenimientoRepository,
  ) {
    this.repository = repository;
  }

  execute(): Promise<MantenimientoStats> {
    return this.repository.getStats();
  }
}