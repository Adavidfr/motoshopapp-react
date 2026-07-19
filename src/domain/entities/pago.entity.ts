// src/domain/entities/pago.entity.ts

export type PagoEstado = 'pendiente' | 'completado' | 'fallido' | 'reembolsado';
export type PagoMetodo = 'efectivo' | 'tarjeta' | 'transferencia' | 'credito' | 'otro';

export interface Pago {
  id_pago: number;
  id_venta: number;
  monto: number;
  metodo_pago: PagoMetodo;
  estado: PagoEstado;
  fecha_pago: string;
  referencia: string;
}

export interface PagoStats {
  total_pagos: number;
  monto_total: number;
  por_estado: Record<PagoEstado, number>;
  por_metodo: Record<PagoMetodo, number>;
}

export interface PaginatedPagos {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pago[];
}
