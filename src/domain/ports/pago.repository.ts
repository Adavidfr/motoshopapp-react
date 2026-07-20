// src/domain/ports/pago.repository.ts
import type { Pago, PagoStats, PaginatedPagos } from '../entities/pago.entity';

export interface PagoFilters {
  page?: number;
  pageSize?: number;
  estado?: string;
  id_venta?: number;
  metodo_pago?: string;
  search?: string;
}

export interface PagoRepository {
  listPagos(filters?: PagoFilters): Promise<PaginatedPagos>;
  getPago(id: number): Promise<Pago>;
  createPago(payload: Omit<Pago, 'id_pago' | 'fecha_pago'>): Promise<Pago>;
  updatePago(id: number, payload: Partial<Pago>): Promise<Pago>;
  deletePago(id: number): Promise<void>;
  getStats(): Promise<PagoStats>;
}
