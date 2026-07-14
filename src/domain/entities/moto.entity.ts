// src/domain/entities/moto.entity.ts

export interface Moto {
  idMoto: number;
  modelo: string;
  anio: number;
  cilindraje: number;
  color: string;
  precio: number;
  stock: number;
  estado: string;
  imagen: string | null;
  fechaRegistro: string;
  categoria: number; // ID de categoría
  marca: number;      // ID de marca
}
