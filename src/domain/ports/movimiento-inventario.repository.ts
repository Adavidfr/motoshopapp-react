// src/domain/ports/movimiento-inventario.repository.ts
import type { MovimientoInventario } from '../entities/movimiento-inventario.entity';

export interface MovimientoInventarioRepository {
  listMovimientos(): Promise<MovimientoInventario[]>;
  createMovimiento(payload: any): Promise<MovimientoInventario>;
}
