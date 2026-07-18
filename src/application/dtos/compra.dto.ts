import { z } from 'zod';

import type {
  CompraEstado,
} from '../../domain/entities/compra.entity';

const decimalPositivoSchema = z
  .string()
  .trim()
  .min(1, 'Este campo es obligatorio.')
  .refine(
    (value) => {
      const numberValue = Number(value);

      return (
        Number.isFinite(numberValue) &&
        numberValue > 0
      );
    },
    {
      message:
        'El valor debe ser un número mayor que cero.',
    },
  );

export const compraSchema = z
  .object({
    proveedor: z
      .number({
        message:
          'Debe seleccionar un proveedor.',
      })
      .int(
        'El identificador del proveedor debe ser entero.',
      )
      .positive(
        'Debe seleccionar un proveedor válido.',
      ),

    moto: z
      .number()
      .int()
      .positive()
      .nullable(),

    repuesto: z
      .number()
      .int()
      .positive()
      .nullable(),

    cantidad: z
      .number({
        message:
          'La cantidad debe ser un número.',
      })
      .int(
        'La cantidad debe ser un número entero.',
      )
      .positive(
        'La cantidad debe ser mayor que cero.',
      ),

    precio_unitario: decimalPositivoSchema,

    subtotal: decimalPositivoSchema,

    estado: z.enum([
      'Pendiente',
      'Recibida',
      'Cancelada',
    ]),
  })
  .superRefine((data, context) => {
    if (!data.moto && !data.repuesto) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['moto'],
        message:
          'Debe seleccionar una moto o un repuesto.',
      });

      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['repuesto'],
        message:
          'Debe seleccionar una moto o un repuesto.',
      });
    }

    if (data.moto && data.repuesto) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['moto'],
        message:
          'Solo puede seleccionar una moto o un repuesto.',
      });

      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['repuesto'],
        message:
          'Solo puede seleccionar una moto o un repuesto.',
      });
    }

    const precio = Number(data.precio_unitario);
    const subtotal = Number(data.subtotal);

    if (
      Number.isFinite(precio) &&
      Number.isFinite(subtotal)
    ) {
      const subtotalEsperado =
        data.cantidad * precio;

      const diferencia = Math.abs(
        subtotalEsperado - subtotal,
      );

      if (diferencia > 0.01) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['subtotal'],
          message:
            'El subtotal no coincide con la cantidad por el precio unitario.',
        });
      }
    }
  });

export type CompraDto = z.infer<
  typeof compraSchema
>;

export interface CompraFilters {
  page?: number;
  pageSize?: number;
  search?: string;

  proveedor?: number;
  moto?: number;
  repuesto?: number;

  estado?: CompraEstado;

  fechaCompraAfter?: string;
  fechaCompraBefore?: string;

  ordering?:
    | 'fecha_compra'
    | '-fecha_compra'
    | 'cantidad'
    | '-cantidad'
    | 'precio_unitario'
    | '-precio_unitario'
    | 'subtotal'
    | '-subtotal'
    | 'estado'
    | '-estado';
}