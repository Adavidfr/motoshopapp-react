import { z } from 'zod';

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable()
  .optional();

export const proveedorSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre del proveedor es obligatorio.')
    .max(120, 'El nombre no puede superar los 120 caracteres.'),

  contacto: z
    .string()
    .trim()
    .max(100, 'El contacto no puede superar los 100 caracteres.')
    .transform((value) => value || null)
    .nullable()
    .optional(),

  telefono: z
    .string()
    .trim()
    .max(20, 'El teléfono no puede superar los 20 caracteres.')
    .regex(
      /^[0-9+\-\s()]*$/,
      'El teléfono contiene caracteres no permitidos.',
    )
    .transform((value) => value || null)
    .nullable()
    .optional(),

  correo: z
    .union([
      z.literal(''),
      z
        .string()
        .trim()
        .email('Ingrese un correo electrónico válido.'),
      z.null(),
    ])
    .transform((value) => value || null)
    .optional(),

  direccion: optionalText,

  estado: z.boolean(),
});

export type ProveedorDto = z.infer<typeof proveedorSchema>;

export interface ProveedorFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  estado?: boolean;
  nombre?: string;
  contacto?: string;
  correo?: string;
  ordering?: 'nombre' | '-nombre' | 'estado' | '-estado';
}