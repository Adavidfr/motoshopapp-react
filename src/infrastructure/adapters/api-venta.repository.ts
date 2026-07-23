// src/infrastructure/adapters/api-venta.repository.ts
import type { VentaRepository, VentaFilters } from '../../domain/ports/venta.repository';
import type {
  Venta,
  VentaStats,
  PaginatedVentas,
  VentaCreatePayload,
  VentaUpdatePayload,
  VentaResumen,
} from '../../domain/entities/venta.entity';
import type { Financiamiento, FinanciamientoCreatePayload } from '../../domain/entities/financiamiento.entity';
import { httpClient } from '../http/axios-client';
import { ApiFinanciamientoRepository, type ApiFinanciamientoResponse } from './api-financiamiento.repository';

const financiamientoMapper = new ApiFinanciamientoRepository();

interface ApiVenta {
  id_venta: number;
  id_pedido: number;
  username_cliente: string;
  id_usuario_cliente: number;
  username_vendedor: string;
  id_usuario_vendedor: number;
  total_venta: string | number;
  total_pagado?: string | number;
  saldo_pendiente?: string | number;
  estado: Venta['estado'];
  fecha_venta: string;
  num_financiamientos: number;
  financiamientos?: Venta['financiamientos'];
}

export class ApiVentaRepository implements VentaRepository {
  private mapVenta(data: ApiVenta): Venta {
    return {
      id_venta: data.id_venta,
      id_pedido: data.id_pedido,
      username_cliente: data.username_cliente,
      id_usuario_cliente: data.id_usuario_cliente,
      username_vendedor: data.username_vendedor,
      id_usuario_vendedor: data.id_usuario_vendedor,
      total_venta: Number(data.total_venta),
      total_pagado: data.total_pagado !== undefined ? Number(data.total_pagado) : undefined,
      saldo_pendiente: data.saldo_pendiente !== undefined ? Number(data.saldo_pendiente) : undefined,
      estado: data.estado,
      fecha_venta: data.fecha_venta,
      num_financiamientos: Number(data.num_financiamientos),
      financiamientos: data.financiamientos || [],
    };
  }

  async listVentas(filters?: VentaFilters): Promise<PaginatedVentas> {
    const params: Record<string, string | number> = {};
    if (filters) {
      if (filters.page) params.page = filters.page;
      if (filters.pageSize) params.page_size = filters.pageSize;
      if (filters.estado) params.estado = filters.estado;
      if (filters.search) params.search = filters.search;
    }
    const response = await httpClient.get<{ count: number; next: string | null; previous: string | null; results: ApiVenta[] }>('/ventas/', { params });
    return {
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
      results: (response.data.results || []).map((item) => this.mapVenta(item)),
    };
  }

  async getVenta(id: number): Promise<Venta> {
    const response = await httpClient.get<ApiVenta>(`/ventas/${id}/`);
    return this.mapVenta(response.data);
  }

  async createVenta(payload: VentaCreatePayload): Promise<Venta> {
    const response = await httpClient.post<ApiVenta>('/ventas/', {
      id_pedido: payload.id_pedido,
    });
    return this.mapVenta(response.data);
  }

  async updateVenta(id: number, payload: VentaUpdatePayload): Promise<Venta> {
    const response = await httpClient.patch<ApiVenta>(`/ventas/${id}/`, payload);
    return this.mapVenta(response.data);
  }

  async deleteVenta(id: number): Promise<void> {
    await httpClient.delete(`/ventas/${id}/`);
  }

  async getStats(): Promise<VentaStats> {
    const response = await httpClient.get<VentaStats>('/ventas/stats/');
    return {
      total_ventas: response.data.total_ventas,
      total_ingresos: Number(response.data.total_ingresos),
      por_estado: response.data.por_estado,
    };
  }

  async getResumen(id: number): Promise<VentaResumen> {
    const response = await httpClient.get<VentaResumen>(`/ventas/${id}/resumen/`);
    return {
      ...response.data,
      total_venta: Number(response.data.total_venta),
      total_pagado: Number(response.data.total_pagado),
      saldo_pendiente: Number(response.data.saldo_pendiente),
    };
  }

  async financiarVenta(id: number, payload: FinanciamientoCreatePayload): Promise<Financiamiento> {
    const entrada = payload.entrada ?? 0;
    const response = await httpClient.post<ApiFinanciamientoResponse>(
      `/ventas/${id}/financiar/`,
      {
        entidad_financiera: payload.entidad_financiera,
        monto_financiado: payload.monto_financiado.toFixed(2),
        entrada: entrada.toFixed(2),
        tasa_interes: payload.tasa_interes.toFixed(2),
        plazo_meses: payload.plazo_meses,
        ...(payload.estado ? { estado: payload.estado } : {}),
      },
    );
    return financiamientoMapper.mapFinanciamiento(response.data);
  }
}
