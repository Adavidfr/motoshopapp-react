export type CompraEstado =
  | 'Pendiente'
  | 'Recibida'
  | 'Cancelada';

/** Transiciones válidas según COMPRA_TRANSICIONES en Django */
export const COMPRA_TRANSICIONES: Record<CompraEstado, CompraEstado[]> = {
  Pendiente: ['Recibida', 'Cancelada'],
  Recibida: [],
  Cancelada: [],
};

export function transicionesCompraPermitidas(estado: CompraEstado): CompraEstado[] {
  return COMPRA_TRANSICIONES[estado] ?? [];
}

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
  stock_aplicado: boolean;
}

export interface CompraStats {
  total: number;
  pendientes: number;
  recibidas: number;
  canceladas: number;
}

export interface PaginatedCompras {
  count: number;
  next: string | null;
  previous: string | null;
  results: Compra[];
}