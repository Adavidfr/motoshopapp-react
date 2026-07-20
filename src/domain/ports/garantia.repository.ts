// src/domain/ports/garantia.repository.ts
import type { Garantia, PaginatedGarantias } from '../entities/garantia.entity';

export interface GarantiaFilters {
  page?: number;
  pageSize?: number;
  estado?: string;
  id_venta?: number;
  search?: string;
}

export interface GarantiaRepository {
  listGarantias(filters?: GarantiaFilters): Promise<PaginatedGarantias>;
  getGarantia(id: number): Promise<Garantia>;
  createGarantia(payload: Omit<Garantia, 'id_garantia'>): Promise<Garantia>;
  updateGarantia(id: number, payload: Partial<Garantia>): Promise<Garantia>;
  deleteGarantia(id: number): Promise<void>;
}
