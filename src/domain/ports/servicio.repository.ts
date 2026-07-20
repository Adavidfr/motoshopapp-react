import type {
  PaginatedServicios,
  Servicio,
  ServicioStats,
} from '../entities/servicio.entity';

import type {
  ServicioDto,
  ServicioFilters,
} from '../../application/dtos/servicio.dto';

export interface ServicioRepository {
  getAll(
    filters?: ServicioFilters,
  ): Promise<PaginatedServicios>;

  getById(
    id: number,
  ): Promise<Servicio>;

  getStats(): Promise<ServicioStats>;

  create(
    dto: ServicioDto,
  ): Promise<Servicio>;

  update(
    id: number,
    dto: Partial<ServicioDto>,
  ): Promise<Servicio>;

  delete(
    id: number,
  ): Promise<void>;
}