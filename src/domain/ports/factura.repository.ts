// src/domain/ports/factura.repository.ts
import type { Factura, PaginatedFacturas } from '../entities/factura.entity';

export interface FacturaFilters {
  page?: number;
  pageSize?: number;
  id_venta?: number;
  search?: string;
}

export interface FacturaRepository {
  listFacturas(filters?: FacturaFilters): Promise<PaginatedFacturas>;
  getFactura(id: number): Promise<Factura>;
  createFactura(payload: Omit<Factura, 'id_factura' | 'fecha_emision'>): Promise<Factura>;
  updateFactura(id: number, payload: Partial<Factura>): Promise<Factura>;
  deleteFactura(id: number): Promise<void>;
}
