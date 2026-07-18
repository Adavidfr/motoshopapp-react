// src/domain/ports/marca.repository.ts
import type { Marca } from '../entities/marca.entity';

export interface MarcaRepository {
  getMarcas(): Promise<Marca[]>;
  createMarca(marca: Omit<Marca, 'idMarca'>): Promise<Marca>;
  updateMarca(id: number, marca: Partial<Marca>): Promise<Marca>;
}
