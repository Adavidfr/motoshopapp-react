import type {
  PaginatedRepuestosMantenimiento,
  RepuestoMantenimiento,
  RepuestoMantenimientoStats,
} from '../entities/repuesto-mantenimiento.entity';

import type {
  RepuestoMantenimientoDto,
  RepuestoMantenimientoFilters,
} from '../../application/dtos/repuesto-mantenimiento.dto';

export interface RepuestoMantenimientoRepository {
  getAll(
    filters?: RepuestoMantenimientoFilters,
  ): Promise<PaginatedRepuestosMantenimiento>;

  getById(
    id: number,
  ): Promise<RepuestoMantenimiento>;

  getStats(): Promise<RepuestoMantenimientoStats>;

  create(
    dto: RepuestoMantenimientoDto,
  ): Promise<RepuestoMantenimiento>;

  update(
    id: number,
    dto: Partial<RepuestoMantenimientoDto>,
  ): Promise<RepuestoMantenimiento>;

  delete(id: number): Promise<void>;
}