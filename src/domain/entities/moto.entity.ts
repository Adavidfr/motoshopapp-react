// src/domain/entities/moto.entity.ts

/** Valor exacto que Django valida en inventario.py (`moto.estado != 'disponible'`). */
export const MOTO_ESTADO_DISPONIBLE = 'disponible' as const;

export const MOTO_ESTADOS = ['disponible', 'reservada', 'vendida'] as const;

export type MotoEstado = (typeof MOTO_ESTADOS)[number];

/** Normaliza el estado al enviar POST/PATCH — Django exige minúsculas exactas. */
export function normalizeMotoEstadoForApi(estado: string): MotoEstado {
  const normalized = estado.trim().toLowerCase();
  if (normalized === 'disponible' || normalized === 'reservada' || normalized === 'vendida') {
    return normalized;
  }
  return MOTO_ESTADO_DISPONIBLE;
}

/** Normaliza el valor leído de la API para poblar el select del formulario admin. */
export function normalizeMotoEstadoForForm(estado: string): MotoEstado {
  return normalizeMotoEstadoForApi(estado);
}

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
  /** Nombre de la categoría (respuesta anidada del serializer). */
  categoria: string;
  /** Nombre de la marca (respuesta anidada del serializer). */
  marca: string;
}

/**
 * Payload multipart POST/PATCH — claves alineadas con MotoSerializer (DRF).
 * Los FK se envían como PK en los campos `marca` y `categoria`, no como id_marca/id_categoria.
 */
export interface MotoCreatePayload {
  modelo: string;
  anio: number;
  cilindraje: number;
  color: string;
  precio: number;
  stock: number;
  estado: MotoEstado;
  marca: number;
  categoria: number;
  imagen?: File;
}

export type MotoUpdatePayload = Partial<MotoCreatePayload>;
