// src/domain/entities/pago.entity.ts

export type PagoEstado = 'pendiente' | 'completado' | 'fallido' | 'reembolsado';
export type PagoMetodo = 'efectivo' | 'tarjeta' | 'transferencia' | 'credito' | 'otro';
export type PagoTipo = 'contado' | 'entrada' | 'cuota' | 'abono' | 'reembolso';

export interface PagoProcesadoPor {
  id: number;
  username: string;
}

export interface Pago {
  id_pago: number;
  id_venta: number;
  id_financiamiento: number | null;
  monto: number;
  metodo_pago: PagoMetodo;
  tipo_pago: PagoTipo;
  estado: PagoEstado;
  fecha_pago: string;
  referencia: string;
  comprobante?: string | null;
  procesado_por: number | null;
  procesado_por_info: PagoProcesadoPor | null;
}

/** Campos aceptados por PagoCreateSerializer (monto se serializa en el adapter). */
export interface PagoCreatePayload {
  id_venta: number;
  monto: number;
  metodo_pago: PagoMetodo;
  tipo_pago?: PagoTipo;
  id_financiamiento?: number | null;
  referencia?: string;
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
