// src/domain/entities/factura.entity.ts

export interface Factura {
  id_factura: number;
  id_pago: number;
  id_venta: number;
  numero_factura: string;
  fecha_emision: string;
  subtotal: number;
  iva: number;
  total: number;
}

export interface FacturaCreatePayload {
  id_pago: number;
}

export interface PaginatedFacturas {
  count: number;
  next: string | null;
  previous: string | null;
  results: Factura[];
}
