import type {
  Compra,
  CompraStats,
  PaginatedCompras,
} from '../entities/compra.entity';

import type {
  CompraDto,
  CompraFilters,
} from '../../application/dtos/compra.dto';

export interface CompraRepository {
  getAll(
    filters?: CompraFilters,
  ): Promise<PaginatedCompras>;

  getById(
    id: number,
  ): Promise<Compra>;

  getStats(): Promise<CompraStats>;

  create(
    dto: CompraDto,
  ): Promise<Compra>;

  update(
    id: number,
    dto: Partial<CompraDto>,
  ): Promise<Compra>;

  delete(
    id: number,
  ): Promise<void>;
}