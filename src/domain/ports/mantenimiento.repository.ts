import type {
  Mantenimiento,
  MantenimientoStats,
  PaginatedMantenimientos,
} from '../entities/mantenimiento.entity';

import type {
  MantenimientoDto,
  MantenimientoFilters,
} from '../../application/dtos/mantenimiento.dto';

export interface MantenimientoRepository {
  getAll(
    filters?: MantenimientoFilters,
  ): Promise<PaginatedMantenimientos>;

  getById(
    id: number,
  ): Promise<Mantenimiento>;

  getStats(): Promise<MantenimientoStats>;

  create(
    dto: MantenimientoDto,
  ): Promise<Mantenimiento>;

  update(
    id: number,
    dto: Partial<MantenimientoDto>,
  ): Promise<Mantenimiento>;

  delete(
    id: number,
  ): Promise<void>;
}