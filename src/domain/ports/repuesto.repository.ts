// src/domain/ports/repuesto.repository.ts
import type { Repuesto } from '../entities/repuesto.entity';

export interface ListRepuestosParams {
  search?: string;
}

export interface RepuestoRepository {
  listRepuestos(params?: ListRepuestosParams): Promise<Repuesto[]>;
  createRepuesto(formData: FormData): Promise<Repuesto>;
  updateRepuesto(id: number, formData: FormData): Promise<Repuesto>;
  deleteRepuesto(id: number): Promise<void>;
}
