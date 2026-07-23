// src/domain/ports/historial-estado-venta.repository.ts
import type { HistorialEstadoVenta, PaginatedHistorialEstadoVenta } from '../entities/historial-estado-venta.entity';

export interface HistorialFilters {
  page?: number;
  pageSize?: number;
  id_venta?: number;
  estado_nuevo?: string;
  search?: string;
}

export interface HistorialEstadoVentaRepository {
  listHistorial(filters?: HistorialFilters): Promise<PaginatedHistorialEstadoVenta>;
  getHistorial(id: number): Promise<HistorialEstadoVenta>;
}
