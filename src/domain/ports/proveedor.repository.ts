import type {
  PaginatedProveedores,
  Proveedor,
  ProveedorStats,
} from '../entities/proveedor.entity';

import type {
  ProveedorDto,
  ProveedorFilters,
} from '../../application/dtos/proveedor.dto';

export interface ProveedorRepository {
  getAll(filters?: ProveedorFilters): Promise<PaginatedProveedores>;

  getById(id: number): Promise<Proveedor>;

  getStats(): Promise<ProveedorStats>;

  create(dto: ProveedorDto): Promise<Proveedor>;

  update(
    id: number,
    dto: Partial<ProveedorDto>,
  ): Promise<Proveedor>;

  delete(id: number): Promise<void>;
}