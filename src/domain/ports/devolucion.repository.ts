// src/domain/ports/devolucion.repository.ts
import type { Devolucion, DevolucionStats, PaginatedDevoluciones } from '../entities/devolucion.entity';

export interface DevolucionFilters {
  page?: number;
  pageSize?: number;
  estado?: string;
  id_venta?: number;
  search?: string;
}

export interface DevolucionRepository {
  listDevoluciones(filters?: DevolucionFilters): Promise<PaginatedDevoluciones>;
  getDevolucion(id: number): Promise<Devolucion>;
  createDevolucion(payload: Omit<Devolucion, 'id_devolucion' | 'fecha_solicitud' | 'fecha_resolucion'>): Promise<Devolucion>;
  updateDevolucion(id: number, payload: Partial<Devolucion>): Promise<Devolucion>;
  deleteDevolucion(id: number): Promise<void>;
  getStats(): Promise<DevolucionStats>;
}
