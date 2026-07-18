// src/domain/entities/movimiento-inventario.entity.ts

export interface MovimientoInventario {
  idMovimiento: number;
  cantidad: number;
  tipoMovimiento: string;
  descripcion?: string;
  fechaMovimiento: string;
  idMoto?: number | null;
  motoModelo?: string;
  idRepuesto?: number | null;
  repuestoNombre?: string;
  idUsuario: number;
  usuarioNombre?: string;
}
