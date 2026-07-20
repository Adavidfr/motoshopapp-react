// src/infrastructure/adapters/api-categoria.repository.ts
import type { CategoriaRepository } from '../../domain/ports/categoria.repository';
import type { CategoriaMoto } from '../../domain/entities/categoria.entity';
import { httpClient } from '../http/axios-client';

export class ApiCategoriaRepository implements CategoriaRepository {
  private mapCategoria(data: any): CategoriaMoto {
    return {
      idCategoria: data.id_categoria,
      nombre: data.nombre,
      descripcion: data.descripcion || '',
      estado: data.estado,
    };
  }

  async getCategorias(): Promise<CategoriaMoto[]> {
    const response = await httpClient.get('/categorias-moto/');
    const list = Array.isArray(response.data) ? response.data : (response.data.results || []);
    return list.map((item: any) => this.mapCategoria(item));
  }

  async createCategoria(categoria: Omit<CategoriaMoto, 'idCategoria'>): Promise<CategoriaMoto> {
    const response = await httpClient.post('/categorias-moto/', {
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      estado: categoria.estado,
    });
    return this.mapCategoria(response.data);
  }

  async updateCategoria(id: number, categoria: Partial<CategoriaMoto>): Promise<CategoriaMoto> {
    const payload: any = {};
    if (categoria.nombre !== undefined) payload.nombre = categoria.nombre;
    if (categoria.descripcion !== undefined) payload.descripcion = categoria.descripcion;
    if (categoria.estado !== undefined) payload.estado = categoria.estado;

    const response = await httpClient.patch(`/categorias-moto/${id}/`, payload);
    return this.mapCategoria(response.data);
  }
}
