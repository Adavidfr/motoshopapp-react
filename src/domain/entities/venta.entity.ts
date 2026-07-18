// src/domain/entities/venta.entity.ts

export type VentaEstado = 'pendiente' | 'completada' | 'anulada';

export interface Venta {
  id_venta: number;
  id_pedido: number;
  username_cliente: string;
  id_usuario_cliente: number;
  username_vendedor: string;
  id_usuario_vendedor: number;
  total_venta: number;
  estado: VentaEstado;
  fecha_venta: string;
  num_financiamientos: number;
  financiamientos?: any[];
}

export interface VentaStats {
  total_ventas: number;
  total_ingresos: number;
  por_estado: Record<VentaEstado, number>;
}

export interface PaginatedVentas {
  count: number;
  next: string | null;
  previous: string | null;
  results: Venta[];
}
