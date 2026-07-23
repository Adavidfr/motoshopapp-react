// src/domain/ports/repuesto.repository.ts
import type { Repuesto } from '../entities/repuesto.entity';
import type { PaginatedResult } from './moto.repository';

export interface ListRepuestosParams {
  search?: string;
  ordering?: string;
  page?: number;
  limit?: number;
}

export interface RepuestoRepository {
  listRepuestos(params?: ListRepuestosParams): Promise<PaginatedResult<Repuesto>>;
  getRepuesto(id: number): Promise<Repuesto>;
  createRepuesto(formData: FormData): Promise<Repuesto>;
  updateRepuesto(id: number, formData: FormData): Promise<Repuesto>;
  deleteRepuesto(id: number): Promise<void>;
}
