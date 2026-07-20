// src/infrastructure/adapters/api-historial-estado-venta.repository.ts
import type { HistorialEstadoVentaRepository, HistorialFilters } from '../../domain/ports/historial-estado-venta.repository';
import type { HistorialEstadoVenta, PaginatedHistorialEstadoVenta } from '../../domain/entities/historial-estado-venta.entity';
import { httpClient } from '../http/axios-client';

export class ApiHistorialEstadoVentaRepository implements HistorialEstadoVentaRepository {
  private map(data: any): HistorialEstadoVenta {
    return {
      id_historial:    data.id_historial,
      id_venta:        data.id_venta,
      estado_anterior: data.estado_anterior,
      estado_nuevo:    data.estado_nuevo,
      fecha_cambio:    data.fecha_cambio,
      observacion:     data.observacion ?? '',
    };
  }

  async listHistorial(filters?: HistorialFilters): Promise<PaginatedHistorialEstadoVenta> {
    const params: any = {};
    if (filters) {
      if (filters.page)     params.page      = filters.page;
      if (filters.pageSize) params.page_size = filters.pageSize;
      if (filters.id_venta) params.id_venta  = filters.id_venta;
      if (filters.search)   params.search    = filters.search;
    }
    const res = await httpClient.get('/historial-estado-venta/', { params });
    return {
      count: res.data.count,
      next: res.data.next,
      previous: res.data.previous,
      results: (res.data.results || []).map((i: any) => this.map(i)),
    };
  }

  async getHistorial(id: number): Promise<HistorialEstadoVenta> {
    const res = await httpClient.get(`/historial-estado-venta/${id}/`);
    return this.map(res.data);
  }

  async createHistorial(payload: Omit<HistorialEstadoVenta, 'id_historial' | 'fecha_cambio'>): Promise<HistorialEstadoVenta> {
    const res = await httpClient.post('/historial-estado-venta/', payload);
    return this.map(res.data);
  }

  async updateHistorial(id: number, payload: Partial<HistorialEstadoVenta>): Promise<HistorialEstadoVenta> {
    const res = await httpClient.patch(`/historial-estado-venta/${id}/`, payload);
    return this.map(res.data);
  }

  async deleteHistorial(id: number): Promise<void> {
    await httpClient.delete(`/historial-estado-venta/${id}/`);
  }
}
