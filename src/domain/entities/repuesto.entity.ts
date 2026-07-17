// src/domain/entities/repuesto.entity.ts

export interface Repuesto {
  idRepuesto: number;
  nombre: string;
  descripcion?: string;
  sku: string;
  costo: number;
  precioVenta: number;
  stock: number;
  estado: string;
  imagen: string | null;
  fechaRegistro: string;
}
