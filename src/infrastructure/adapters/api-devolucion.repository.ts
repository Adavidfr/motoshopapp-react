// src/infrastructure/adapters/api-devolucion.repository.ts
import type { DevolucionRepository, DevolucionFilters } from '../../domain/ports/devolucion.repository';
import type { Devolucion, DevolucionStats, PaginatedDevoluciones } from '../../domain/entities/devolucion.entity';
import { httpClient } from '../http/axios-client';

export class ApiDevolucionRepository implements DevolucionRepository {
  private map(data: any): Devolucion {
    return {
      id_devolucion:    data.id_devolucion,
      id_venta:         data.id_venta,
      motivo:           data.motivo,
      estado:           data.estado,
      monto_devolucion: Number(data.monto_devolucion),
      fecha_solicitud:  data.fecha_solicitud,
      fecha_resolucion: data.fecha_resolucion,
    };
  }

  async listDevoluciones(filters?: DevolucionFilters): Promise<PaginatedDevoluciones> {
    const params: any = {};
    if (filters) {
      if (filters.page)     params.page      = filters.page;
      if (filters.pageSize) params.page_size = filters.pageSize;
      if (filters.estado)   params.estado    = filters.estado;
      if (filters.id_venta) params.id_venta  = filters.id_venta;
      if (filters.search)   params.search    = filters.search;
    }
    const res = await httpClient.get('/devoluciones/', { params });
    return {
      count: res.data.count,
      next: res.data.next,
      previous: res.data.previous,
      results: (res.data.results || []).map((i: any) => this.map(i)),
    };
  }

  async getDevolucion(id: number): Promise<Devolucion> {
    const res = await httpClient.get(`/devoluciones/${id}/`);
    return this.map(res.data);
  }

  async createDevolucion(payload: Omit<Devolucion, 'id_devolucion' | 'fecha_solicitud' | 'fecha_resolucion'>): Promise<Devolucion> {
    const res = await httpClient.post('/devoluciones/', payload);
    return this.map(res.data);
  }

  async updateDevolucion(id: number, payload: Partial<Devolucion>): Promise<Devolucion> {
    const res = await httpClient.patch(`/devoluciones/${id}/`, payload);
    return this.map(res.data);
  }

  async deleteDevolucion(id: number): Promise<void> {
    await httpClient.delete(`/devoluciones/${id}/`);
  }

  async getStats(): Promise<DevolucionStats> {
    const res = await httpClient.get('/devoluciones/stats/');
    return {
      total_devoluciones: res.data.total_devoluciones,
      monto_total:        Number(res.data.monto_total),
      por_estado:         res.data.por_estado,
    };
  }
}
