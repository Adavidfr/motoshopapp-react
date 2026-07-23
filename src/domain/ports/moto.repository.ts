// src/domain/ports/moto.repository.ts
import type { Moto, MotoCreatePayload, MotoUpdatePayload } from '../entities/moto.entity';

export interface ListMotosParams {
  limit?: number;
  offset?: number;
  ordering?: string;
  search?: string;
  marca?: number | string;
  categoria?: number | string;
  page?: number;
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
  createMoto(payload: MotoCreatePayload): Promise<Moto>;
  updateMoto(id: number, payload: MotoUpdatePayload): Promise<Moto>;
  deleteMoto(id: number): Promise<void>;
}
