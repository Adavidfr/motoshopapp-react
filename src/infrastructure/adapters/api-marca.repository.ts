// src/infrastructure/adapters/api-marca.repository.ts
import type { MarcaRepository } from '../../domain/ports/marca.repository';
import type { Marca } from '../../domain/entities/marca.entity';
import { httpClient } from '../http/axios-client';

export class ApiMarcaRepository implements MarcaRepository {
  private mapMarca(data: any): Marca {
    return {
      idMarca: data.id_marca,
      nombre: data.nombre,
      descripcion: data.descripcion || '',
      estado: data.estado,
    };
  }

  async getMarcas(): Promise<Marca[]> {
    const response = await httpClient.get('/marcas/');
    // Handle array or paginated response format
    const list = Array.isArray(response.data) ? response.data : (response.data.results || []);
    return list.map((item: any) => this.mapMarca(item));
  }

  async createMarca(marca: Omit<Marca, 'idMarca'>): Promise<Marca> {
    const response = await httpClient.post('/marcas/', {
      nombre: marca.nombre,
      descripcion: marca.descripcion,
      estado: marca.estado,
    });
    return this.mapMarca(response.data);
  }

  async updateMarca(id: number, marca: Partial<Marca>): Promise<Marca> {
    const payload: any = {};
    if (marca.nombre !== undefined) payload.nombre = marca.nombre;
    if (marca.descripcion !== undefined) payload.descripcion = marca.descripcion;
    if (marca.estado !== undefined) payload.estado = marca.estado;

    const response = await httpClient.patch(`/marcas/${id}/`, payload);
    return this.mapMarca(response.data);
  }
}
