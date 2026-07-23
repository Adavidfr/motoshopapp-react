// src/infrastructure/adapters/api-historial-estado-venta.repository.ts
import type { HistorialEstadoVentaRepository, HistorialFilters } from '../../domain/ports/historial-estado-venta.repository';
import type { HistorialEstadoVenta, PaginatedHistorialEstadoVenta } from '../../domain/entities/historial-estado-venta.entity';
import { httpClient } from '../http/axios-client';

interface ApiHistorial {
  id_historial: number;
  id_venta: number;
  estado_anterior: string;
  estado_nuevo: string;
  fecha_cambio: string;
  observacion?: string;
  id_usuario?: number;
}

export class ApiHistorialEstadoVentaRepository implements HistorialEstadoVentaRepository {
  private map(data: ApiHistorial): HistorialEstadoVenta {
    return {
      id_historial: data.id_historial,
      id_venta: data.id_venta,
      estado_anterior: data.estado_anterior,
      estado_nuevo: data.estado_nuevo,
      fecha_cambio: data.fecha_cambio,
      observacion: data.observacion ?? '',
      id_usuario: data.id_usuario ?? null,
    };
  }

  async listHistorial(filters?: HistorialFilters): Promise<PaginatedHistorialEstadoVenta> {
    const params: Record<string, string | number> = {};
    if (filters) {
      if (filters.page) params.page = filters.page;
      if (filters.pageSize) params.page_size = filters.pageSize;
      if (filters.id_venta) params.id_venta = filters.id_venta;
      if (filters.estado_nuevo) params.estado_nuevo = filters.estado_nuevo;
      if (filters.search) params.search = filters.search;
    }
    const res = await httpClient.get<{ count: number; next: string | null; previous: string | null; results: ApiHistorial[] }>('/historial-estado-venta/', { params });
    return {
      count: res.data.count,
      next: res.data.next,
      previous: res.data.previous,
      results: (res.data.results || []).map((i) => this.map(i)),
    };
  }

  async getHistorial(id: number): Promise<HistorialEstadoVenta> {
    const res = await httpClient.get<ApiHistorial>(`/historial-estado-venta/${id}/`);
    return this.map(res.data);
  }
}
