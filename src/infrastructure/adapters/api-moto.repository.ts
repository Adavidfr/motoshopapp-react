// src/infrastructure/adapters/api-moto.repository.ts
import type { MotoRepository, ListMotosParams, PaginatedResult } from '../../domain/ports/moto.repository';
import type { Moto } from '../../domain/entities/moto.entity';
import { httpClient } from '../http/axios-client';

export class ApiMotoRepository implements MotoRepository {
  private mapMoto(data: any): Moto {
    return {
      idMoto: data.id_moto,
      modelo: data.modelo,
      anio: data.anio,
      cilindraje: data.cilindraje,
      color: data.color,
      precio: Number(data.precio),
      stock: data.stock,
      estado: data.estado,
      imagen: data.imagen || null,
      fechaRegistro: data.fecha_registro,
      categoria: data.categoria,
      marca: data.marca,
    };
  }

  async listMotos(params?: ListMotosParams): Promise<PaginatedResult<Moto>> {
    const response = await httpClient.get('/motos/', { params });
    return {
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
      results: response.data.results.map((item: any) => this.mapMoto(item)),
    };
  }

  async getMoto(id: number): Promise<Moto> {
    const response = await httpClient.get(`/motos/${id}/`);
    return this.mapMoto(response.data);
  }
}
