// src/domain/ports/factura.repository.ts
import type { Factura, FacturaCreatePayload, PaginatedFacturas } from '../entities/factura.entity';

export interface FacturaFilters {
  page?: number;
  pageSize?: number;
  id_venta?: number;
  id_pago?: number;
  search?: string;
  numero_factura?: string;
}

export interface FacturaRepository {
  listFacturas(filters?: FacturaFilters): Promise<PaginatedFacturas>;
  getFactura(id: number): Promise<Factura>;
  createFactura(payload: FacturaCreatePayload): Promise<Factura>;
  downloadFacturaPdf(id: number, options?: { inline?: boolean }): Promise<Blob>;
}
