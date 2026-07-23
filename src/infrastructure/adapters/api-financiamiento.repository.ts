// src/infrastructure/adapters/api-financiamiento.repository.ts
import type { FinanciamientoRepository, FinanciamientoFilters } from '../../domain/ports/financiamiento.repository';
import type {
  Financiamiento,
  FinanciamientoStats,
  FinanciamientoCreatePayload,
  FinanciamientoUpdatePayload,
  PaginatedFinanciamientos,
} from '../../domain/entities/financiamiento.entity';
import { httpClient } from '../http/axios-client';

export interface ApiFinanciamientoResponse {
  id_financiamiento: number;
  id_venta: number;
  entidad_financiera: string;
  monto_financiado: string | number;
  entrada: string | number;
  saldo_pendiente: string | number;
  tasa_interes: string | number;
  plazo_meses: number;
  cuota_mensual: string | number;
  estado: Financiamiento['estado'];
}

interface ApiFinanciamiento extends ApiFinanciamientoResponse {}

function parseDecimal(value: string | number): number {
  return typeof value === 'number' ? value : Number(value);
}

function formatDecimal(value: number): string {
  return value.toFixed(2);
}

export class ApiFinanciamientoRepository implements FinanciamientoRepository {
  mapFinanciamiento(data: ApiFinanciamiento): Financiamiento {
    return {
      id_financiamiento: data.id_financiamiento,
      id_venta: data.id_venta,
      entidad_financiera: data.entidad_financiera,
      monto_financiado: parseDecimal(data.monto_financiado),
      entrada: parseDecimal(data.entrada ?? 0),
      saldo_pendiente: parseDecimal(data.saldo_pendiente ?? 0),
      tasa_interes: parseDecimal(data.tasa_interes),
      plazo_meses: Number(data.plazo_meses),
      cuota_mensual: parseDecimal(data.cuota_mensual),
      estado: data.estado,
    };
  }

  async listFinanciamientos(filters?: FinanciamientoFilters): Promise<PaginatedFinanciamientos> {
    const params: Record<string, string | number> = {};
    if (filters) {
      if (filters.page) params.page = filters.page;
      if (filters.pageSize) params.page_size = filters.pageSize;
      if (filters.estado) params.estado = filters.estado;
      if (filters.id_venta) params.id_venta = filters.id_venta;
      if (filters.entidad_financiera) params.entidad_financiera = filters.entidad_financiera;
      if (filters.monto_min != null) params.monto_min = filters.monto_min;
      if (filters.monto_max != null) params.monto_max = filters.monto_max;
    }
    const response = await httpClient.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: ApiFinanciamiento[];
    }>('/financiamientos/', { params });
    return {
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
      results: (response.data.results || []).map((item) => this.mapFinanciamiento(item)),
    };
  }

  async getFinanciamiento(id: number): Promise<Financiamiento> {
    const response = await httpClient.get<ApiFinanciamiento>(`/financiamientos/${id}/`);
    return this.mapFinanciamiento(response.data);
  }

  async createFinanciamiento(
    payload: FinanciamientoCreatePayload & { id_venta: number },
  ): Promise<Financiamiento> {
    const response = await httpClient.post<ApiFinanciamiento>('/financiamientos/', {
      id_venta: payload.id_venta,
      entidad_financiera: payload.entidad_financiera,
      monto_financiado: formatDecimal(payload.monto_financiado),
      entrada: formatDecimal(payload.entrada ?? 0),
      tasa_interes: formatDecimal(payload.tasa_interes),
      plazo_meses: payload.plazo_meses,
      ...(payload.estado ? { estado: payload.estado } : {}),
    });
    return this.mapFinanciamiento(response.data);
  }

  async updateFinanciamiento(id: number, payload: FinanciamientoUpdatePayload): Promise<Financiamiento> {
    const response = await httpClient.patch<ApiFinanciamiento>(`/financiamientos/${id}/`, payload);
    return this.mapFinanciamiento(response.data);
  }

  async deleteFinanciamiento(id: number): Promise<void> {
    await httpClient.delete(`/financiamientos/${id}/`);
  }

  async getStats(): Promise<FinanciamientoStats> {
    const response = await httpClient.get<FinanciamientoStats>('/financiamientos/stats/');
    return {
      total_financiamientos: response.data.total_financiamientos,
      monto_total: parseDecimal(response.data.monto_total),
      monto_promedio: parseDecimal(response.data.monto_promedio),
      cuota_promedio: parseDecimal(response.data.cuota_promedio),
      plazo_promedio_meses: parseDecimal(response.data.plazo_promedio_meses),
      por_estado: response.data.por_estado,
    };
  }
}
