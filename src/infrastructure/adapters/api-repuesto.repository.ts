// src/infrastructure/adapters/api-repuesto.repository.ts
import type { RepuestoRepository, ListRepuestosParams } from '../../domain/ports/repuesto.repository';
import type { PaginatedResult } from '../../domain/ports/moto.repository';
import type { Repuesto } from '../../domain/entities/repuesto.entity';
import { httpClient } from '../http/axios-client';
import { resolveMediaUrl } from '../config/api.config';

interface ApiRepuesto {
  id_repuesto: number;
  nombre: string;
  descripcion?: string | null;
  sku: string;
  costo: string | number;
  precio_venta: string | number;
  stock: number;
  estado: string;
  imagen: string | null;
  fecha_registro: string;
}

export class ApiRepuestoRepository implements RepuestoRepository {
  private mapRepuesto(data: ApiRepuesto): Repuesto {
    return {
      idRepuesto: data.id_repuesto,
      nombre: data.nombre,
      descripcion: data.descripcion || '',
      sku: data.sku,
      costo: Number(data.costo),
      precioVenta: Number(data.precio_venta),
      stock: data.stock,
      estado: data.estado,
      imagen: data.imagen ? resolveMediaUrl(data.imagen) : null,
      fechaRegistro: data.fecha_registro,
    };
  }

  async listRepuestos(params?: ListRepuestosParams): Promise<PaginatedResult<Repuesto>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.ordering) queryParams.ordering = params.ordering;
    if (params?.page !== undefined) queryParams.page = params.page;
    if (params?.limit !== undefined) queryParams.limit = params.limit;

    const response = await httpClient.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results?: ApiRepuesto[];
    }>('/repuestos/', { params: queryParams });

    const list = response.data.results ?? [];
    return {
      count: response.data.count ?? list.length,
      next: response.data.next ?? null,
      previous: response.data.previous ?? null,
      results: list.map((item) => this.mapRepuesto(item)),
    };
  }

  async getRepuesto(id: number): Promise<Repuesto> {
    const response = await httpClient.get<ApiRepuesto>(`/repuestos/${id}/`);
    return this.mapRepuesto(response.data);
  }

  async createRepuesto(formData: FormData): Promise<Repuesto> {
    const response = await httpClient.post<ApiRepuesto>('/repuestos/', formData);
    return this.mapRepuesto(response.data);
  }

  async updateRepuesto(id: number, formData: FormData): Promise<Repuesto> {
    const response = await httpClient.patch<ApiRepuesto>(`/repuestos/${id}/`, formData);
    return this.mapRepuesto(response.data);
  }

  async deleteRepuesto(id: number): Promise<void> {
    await httpClient.delete(`/repuestos/${id}/`);
  }
}
