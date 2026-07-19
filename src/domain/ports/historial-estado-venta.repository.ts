// src/domain/ports/historial-estado-venta.repository.ts
import type { HistorialEstadoVenta, PaginatedHistorialEstadoVenta } from '../entities/historial-estado-venta.entity';

export interface HistorialFilters {
  page?: number;
  pageSize?: number;
  id_venta?: number;
  search?: string;
}

export interface HistorialEstadoVentaRepository {
  listHistorial(filters?: HistorialFilters): Promise<PaginatedHistorialEstadoVenta>;
  getHistorial(id: number): Promise<HistorialEstadoVenta>;
  createHistorial(payload: Omit<HistorialEstadoVenta, 'id_historial' | 'fecha_cambio'>): Promise<HistorialEstadoVenta>;
  updateHistorial(id: number, payload: Partial<HistorialEstadoVenta>): Promise<HistorialEstadoVenta>;
  deleteHistorial(id: number): Promise<void>;
}
