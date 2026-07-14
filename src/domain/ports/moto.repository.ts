// src/domain/ports/moto.repository.ts
import type { Moto } from '../entities/moto.entity';

export interface ListMotosParams {
  limit?: number;
  offset?: number;
  ordering?: string;
  search?: string;
}

export interface PaginatedResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface MotoRepository {
  listMotos(params?: ListMotosParams): Promise<PaginatedResult<Moto>>;
  getMoto(id: number): Promise<Moto>;
}
