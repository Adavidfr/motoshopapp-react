// src/domain/ports/venta.repository.ts
import type { Venta, VentaStats, PaginatedVentas } from '../entities/venta.entity';
import type { Financiamiento } from '../entities/financiamiento.entity';

export interface VentaFilters {
  page?: number;
  pageSize?: number;
  estado?: string;
  search?: string;
}

export interface VentaRepository {
  listVentas(filters?: VentaFilters): Promise<PaginatedVentas>;
  getVenta(id: number): Promise<Venta>;
  createVenta(payload: { id_pedido: number; total_venta: string; estado: string }): Promise<Venta>;
  updateVenta(id: number, payload: Partial<Venta>): Promise<Venta>;
  deleteVenta(id: number): Promise<void>;
  getStats(): Promise<VentaStats>;
  financiarVenta(id: number, payload: Omit<Financiamiento, 'id_financiamiento' | 'id_venta'>): Promise<Financiamiento>;
}
