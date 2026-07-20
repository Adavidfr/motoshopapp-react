// src/domain/ports/seguro.repository.ts
import type { Seguro, PaginatedSeguros } from '../entities/seguro.entity';

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
  createSeguro(payload: Omit<Seguro, 'id_seguro'>): Promise<Seguro>;
  updateSeguro(id: number, payload: Partial<Seguro>): Promise<Seguro>;
  deleteSeguro(id: number): Promise<void>;
}
