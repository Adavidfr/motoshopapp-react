// src/infrastructure/adapters/api-devolucion.repository.ts
import type { DevolucionRepository, DevolucionFilters } from '../../domain/ports/devolucion.repository';
import type {
  Devolucion,
  DevolucionCreatePayload,
  DevolucionStats,
  PaginatedDevoluciones,
} from '../../domain/entities/devolucion.entity';
import { httpClient } from '../http/axios-client';

interface ApiDevolucion {
  id_devolucion: number;
  id_venta: number;
  motivo: string;
  estado: Devolucion['estado'];
  monto_devolucion: string | number;
  monto_reembolso_aplicado?: string | number;
  stock_reintegrado?: boolean;
  fecha_solicitud: string;
  fecha_resolucion: string | null;
}

function parseDecimal(value: string | number): number {
  return Number(value);
}

function formatDecimal(value: number): string {
  return value.toFixed(2);
}

export class ApiDevolucionRepository implements DevolucionRepository {
  private map(data: ApiDevolucion): Devolucion {
    return {
      id_devolucion: data.id_devolucion,
      id_venta: data.id_venta,
      motivo: data.motivo,
      estado: data.estado,
      monto_devolucion: parseDecimal(data.monto_devolucion),
      monto_reembolso_aplicado: parseDecimal(data.monto_reembolso_aplicado ?? 0),
      stock_reintegrado: Boolean(data.stock_reintegrado),
      fecha_solicitud: data.fecha_solicitud,
      fecha_resolucion: data.fecha_resolucion,
    };
  }

  async listDevoluciones(filters?: DevolucionFilters): Promise<PaginatedDevoluciones> {
    const params: Record<string, string | number> = {};
    if (filters) {
      if (filters.page) params.page = filters.page;
      if (filters.pageSize) params.page_size = filters.pageSize;
      if (filters.estado) params.estado = filters.estado;
      if (filters.id_venta) params.id_venta = filters.id_venta;
      if (filters.search) params.search = filters.search;
    }
    const res = await httpClient.get<{ count: number; next: string | null; previous: string | null; results: ApiDevolucion[] }>('/devoluciones/', { params });
    return {
      count: res.data.count,
      next: res.data.next,
      previous: res.data.previous,
      results: (res.data.results || []).map((i) => this.map(i)),
    };
  }

  async getDevolucion(id: number): Promise<Devolucion> {
    const res = await httpClient.get<ApiDevolucion>(`/devoluciones/${id}/`);
    return this.map(res.data);
  }

  async createDevolucion(payload: DevolucionCreatePayload): Promise<Devolucion> {
    const res = await httpClient.post<ApiDevolucion>('/devoluciones/', {
      id_venta: payload.id_venta,
      motivo: payload.motivo.trim(),
      monto_devolucion: formatDecimal(payload.monto_devolucion),
    });
    return this.map(res.data);
  }

  async aprobarDevolucion(id: number): Promise<Devolucion> {
    const res = await httpClient.post<ApiDevolucion>(`/devoluciones/${id}/aprobar/`);
    return this.map(res.data);
  }

  async rechazarDevolucion(id: number): Promise<Devolucion> {
    const res = await httpClient.post<ApiDevolucion>(`/devoluciones/${id}/rechazar/`);
    return this.map(res.data);
  }

  async getStats(): Promise<DevolucionStats> {
    const res = await httpClient.get<DevolucionStats>('/devoluciones/stats/');
    return {
      total_devoluciones: res.data.total_devoluciones,
      monto_total: parseDecimal(res.data.monto_total),
      por_estado: res.data.por_estado,
    };
  }
}
