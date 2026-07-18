import { z } from 'zod';

export const servicioSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre del servicio es obligatorio.')
    .max(
      150,
      'El nombre no puede superar los 150 caracteres.',
    ),

  descripcion: z
    .string()
    .trim()
    .max(
      2000,
      'La descripción no puede superar los 2000 caracteres.',
    )
    .nullable()
    .optional(),

  precio_base: z
    .string()
    .trim()
    .min(1, 'El precio base es obligatorio.')
    .refine(
      (value) => {
        const numberValue = Number(value);

        return (
          Number.isFinite(numberValue) &&
          numberValue >= 0
        );
      },
      {
        message:
          'El precio base debe ser un número válido mayor o igual a cero.',
      },
    ),

  tiempo_estimado_minutos: z
    .number({
      message:
        'El tiempo estimado debe ser un número.',
    })
    .int(
      'El tiempo estimado debe ser un número entero.',
    )
    .positive(
      'El tiempo estimado debe ser mayor a cero.',
    ),

  estado: z.boolean(),
});

export type ServicioDto = z.infer<
  typeof servicioSchema
>;

export interface ServicioFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  estado?: boolean;
  nombre?: string;
  descripcion?: string;
  precio_base?: string;
  ordering?:
    | 'nombre'
    | '-nombre'
    | 'precio_base'
    | '-precio_base'
    | 'tiempo_estimado_minutos'
    | '-tiempo_estimado_minutos'
    | 'fecha_creacion'
    | '-fecha_creacion';
}