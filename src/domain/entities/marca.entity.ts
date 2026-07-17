// src/domain/entities/marca.entity.ts

export interface Marca {
  idMarca: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
}
