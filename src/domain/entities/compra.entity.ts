export type CompraEstado =
  | 'Pendiente'
  | 'Recibida'
  | 'Cancelada';

export interface Compra {
  id_compra: number;
  proveedor: number;
  moto: number | null;
  repuesto: number | null;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
  fecha_compra: string;
  estado: CompraEstado;
}

export interface CompraStatsDetail {
  id_compra: number;
  proveedor: string | null;
  moto: string | null;
  repuesto: string | null;
  cantidad: number;
  subtotal: string;
  estado: CompraEstado;
  fecha_compra: string;
}

export interface CompraStats {
  total: number;
  pendientes: number;
  recibidas: number;
  canceladas: number;
  detail: CompraStatsDetail[];
}

export interface PaginatedCompras {
  count: number;
  next: string | null;
  previous: string | null;
  results: Compra[];
}