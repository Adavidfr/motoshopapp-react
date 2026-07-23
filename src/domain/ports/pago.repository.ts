// src/domain/ports/pago.repository.ts
import type { Pago, PagoCreatePayload, PagoStats, PaginatedPagos } from '../entities/pago.entity';

export interface PagoFilters {
  page?: number;
  pageSize?: number;
  estado?: string;
  id_venta?: number;
  metodo_pago?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
}

export interface PagoRepository {
  listPagos(filters?: PagoFilters): Promise<PaginatedPagos>;
  getPago(id: number): Promise<Pago>;
  createPago(payload: PagoCreatePayload): Promise<Pago>;
  getStats(): Promise<PagoStats>;
}
