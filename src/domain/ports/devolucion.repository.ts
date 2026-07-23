// src/domain/ports/devolucion.repository.ts
import type {
  Devolucion,
  DevolucionCreatePayload,
  DevolucionStats,
  PaginatedDevoluciones,
} from '../entities/devolucion.entity';

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
  createDevolucion(payload: DevolucionCreatePayload): Promise<Devolucion>;
  aprobarDevolucion(id: number): Promise<Devolucion>;
  rechazarDevolucion(id: number): Promise<Devolucion>;
  getStats(): Promise<DevolucionStats>;
}
