// src/domain/ports/financiamiento.repository.ts
import type { Financiamiento, FinanciamientoStats, PaginatedFinanciamientos } from '../entities/financiamiento.entity';

export interface FinanciamientoFilters {
  page?: number;
  pageSize?: number;
  estado?: string;
  id_venta?: number;
  entidad_financiera?: string;
}

export interface FinanciamientoRepository {
  listFinanciamientos(filters?: FinanciamientoFilters): Promise<PaginatedFinanciamientos>;
  getFinanciamiento(id: number): Promise<Financiamiento>;
  createFinanciamiento(payload: Omit<Financiamiento, 'id_financiamiento'>): Promise<Financiamiento>;
  updateFinanciamiento(id: number, payload: Partial<Financiamiento>): Promise<Financiamiento>;
  deleteFinanciamiento(id: number): Promise<void>;
  getStats(): Promise<FinanciamientoStats>;
}
