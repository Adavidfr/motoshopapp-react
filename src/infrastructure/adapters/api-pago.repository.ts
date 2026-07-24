// src/infrastructure/adapters/api-pago.repository.ts
import type { PagoRepository, PagoFilters } from '../../domain/ports/pago.repository';
import type {
  Pago, PagoCreatePayload, PagoFacturaResumen, PagoStats, PaginatedPagos,
} from '../../domain/entities/pago.entity';
import { httpClient } from '../http/axios-client';

interface ApiPago {
  id_pago: number;
  id_venta: number;
  id_financiamiento: number | null;
  monto: string | number;
  metodo_pago: Pago['metodo_pago'];
  tipo_pago: Pago['tipo_pago'];
  estado: Pago['estado'];
  fecha_pago: string;
  referencia?: string;
  comprobante?: string | null;
  procesado_por: number | null;
  procesado_por_info: Pago['procesado_por_info'];
  factura?: PagoFacturaResumen | null;
}

function parseDecimal(value: string | number): number {
  return Number(value);
}

function formatDecimal(value: number): string {
  return value.toFixed(2);
}

export class ApiPagoRepository implements PagoRepository {
  private mapPago(data: ApiPago): Pago {
    return {
      id_pago: data.id_pago,
      id_venta: data.id_venta,
      id_financiamiento: data.id_financiamiento,
      monto: parseDecimal(data.monto),
      metodo_pago: data.metodo_pago,
      tipo_pago: data.tipo_pago,
      estado: data.estado,
      fecha_pago: data.fecha_pago,
      referencia: data.referencia ?? '',
      comprobante: data.comprobante ?? null,
      procesado_por: data.procesado_por,
      procesado_por_info: data.procesado_por_info,
      factura: data.factura ?? null,
    };
  }

  async listPagos(filters?: PagoFilters): Promise<PaginatedPagos> {
    const params: Record<string, string | number> = {};
    if (filters) {
      if (filters.page) params.page = filters.page;
      if (filters.pageSize) params.page_size = filters.pageSize;
      if (filters.estado) params.estado = filters.estado;
      if (filters.id_venta) params.id_venta = filters.id_venta;
      if (filters.metodo_pago) params.metodo_pago = filters.metodo_pago;
      if (filters.search) params.search = filters.search;
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;
    }
    const response = await httpClient.get<{ count: number; next: string | null; previous: string | null; results: ApiPago[] }>('/pagos/', { params });
    return {
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
      results: (response.data.results || []).map((item) => this.mapPago(item)),
    };
  }

  async getPago(id: number): Promise<Pago> {
    const response = await httpClient.get<ApiPago>(`/pagos/${id}/`);
    return this.mapPago(response.data);
  }

  async createPago(payload: PagoCreatePayload): Promise<Pago> {
    const body: Record<string, string | number | null> = {
      id_venta: payload.id_venta,
      monto: formatDecimal(payload.monto),
      metodo_pago: payload.metodo_pago,
    };

    if (payload.tipo_pago) body.tipo_pago = payload.tipo_pago;
    if (payload.id_financiamiento != null) body.id_financiamiento = payload.id_financiamiento;
    if (payload.referencia) body.referencia = payload.referencia;

    const response = await httpClient.post<ApiPago>('/pagos/', body);
    return this.mapPago(response.data);
  }

  async getStats(): Promise<PagoStats> {
    const response = await httpClient.get<PagoStats>('/pagos/stats/');
    return {
      total_pagos: response.data.total_pagos,
      monto_total: parseDecimal(response.data.monto_total),
      por_estado: response.data.por_estado,
      por_metodo: response.data.por_metodo,
    };
  }
}
