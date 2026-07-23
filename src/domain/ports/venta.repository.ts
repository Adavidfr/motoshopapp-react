// src/domain/ports/venta.repository.ts
import type {
  Venta,
  VentaStats,
  PaginatedVentas,
  VentaCreatePayload,
  VentaUpdatePayload,
  VentaResumen,
} from '../entities/venta.entity';
import type { Financiamiento, FinanciamientoCreatePayload } from '../entities/financiamiento.entity';

export interface VentaFilters {
  page?: number;
  pageSize?: number;
  estado?: string;
  search?: string;
}

export interface VentaRepository {
  listVentas(filters?: VentaFilters): Promise<PaginatedVentas>;
  getVenta(id: number): Promise<Venta>;
  createVenta(payload: VentaCreatePayload): Promise<Venta>;
  updateVenta(id: number, payload: VentaUpdatePayload): Promise<Venta>;
  deleteVenta(id: number): Promise<void>;
  getStats(): Promise<VentaStats>;
  getResumen(id: number): Promise<VentaResumen>;
  financiarVenta(id: number, payload: FinanciamientoCreatePayload): Promise<Financiamiento>;
}
