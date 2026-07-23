// src/domain/ports/financiamiento.repository.ts
import type {
  Financiamiento,
  FinanciamientoStats,
  FinanciamientoCreatePayload,
  FinanciamientoUpdatePayload,
  PaginatedFinanciamientos,
} from '../entities/financiamiento.entity';

export interface FinanciamientoFilters {
  page?: number;
  pageSize?: number;
  estado?: string;
  id_venta?: number;
  entidad_financiera?: string;
  monto_min?: number;
  monto_max?: number;
}

export interface FinanciamientoRepository {
  listFinanciamientos(filters?: FinanciamientoFilters): Promise<PaginatedFinanciamientos>;
  getFinanciamiento(id: number): Promise<Financiamiento>;
  createFinanciamiento(payload: FinanciamientoCreatePayload & { id_venta: number }): Promise<Financiamiento>;
  updateFinanciamiento(id: number, payload: FinanciamientoUpdatePayload): Promise<Financiamiento>;
  deleteFinanciamiento(id: number): Promise<void>;
  getStats(): Promise<FinanciamientoStats>;
}
