// src/domain/ports/seguro.repository.ts
import type {
  Seguro,
  PaginatedSeguros,
  SeguroCreatePayload,
  SeguroUpdatePayload,
} from '../entities/seguro.entity';

export interface SeguroFilters {
  page?: number;
  pageSize?: number;
  estado?: string;
  id_venta?: number;
  search?: string;
}

export interface SeguroRepository {
  listSeguros(filters?: SeguroFilters): Promise<PaginatedSeguros>;
  getSeguro(id: number): Promise<Seguro>;
  createSeguro(payload: SeguroCreatePayload): Promise<Seguro>;
  updateSeguro(id: number, payload: SeguroUpdatePayload): Promise<Seguro>;
  deleteSeguro(id: number): Promise<void>;
}
