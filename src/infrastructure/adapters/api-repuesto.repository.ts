// src/infrastructure/adapters/api-repuesto.repository.ts
import type { RepuestoRepository, ListRepuestosParams } from '../../domain/ports/repuesto.repository';
import type { Repuesto } from '../../domain/entities/repuesto.entity';
import { httpClient } from '../http/axios-client';

export class ApiRepuestoRepository implements RepuestoRepository {
  private mapRepuesto(data: any): Repuesto {
    return {
      idRepuesto: data.id_repuesto,
      nombre: data.nombre,
      descripcion: data.descripcion || '',
      sku: data.sku,
      costo: Number(data.costo),
      precioVenta: Number(data.precio_venta),
      stock: data.stock,
      estado: data.estado,
      imagen: data.imagen || null,
      fechaRegistro: data.fecha_registro,
    };
  }

  async listRepuestos(params?: ListRepuestosParams): Promise<Repuesto[]> {
    const response = await httpClient.get('/repuestos/', { params });
    const list = Array.isArray(response.data) ? response.data : (response.data.results || []);
    return list.map((item: any) => this.mapRepuesto(item));
  }

  async createRepuesto(formData: FormData): Promise<Repuesto> {
    const response = await httpClient.post('/repuestos/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return this.mapRepuesto(response.data);
  }

  async updateRepuesto(id: number, formData: FormData): Promise<Repuesto> {
    const response = await httpClient.patch(`/repuestos/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return this.mapRepuesto(response.data);
  }

  async deleteRepuesto(id: number): Promise<void> {
    await httpClient.delete(`/repuestos/${id}/`);
  }
}
