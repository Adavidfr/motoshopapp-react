// src/application/dtos/profile.dto.ts
import { z } from 'zod';

export const updateProfileSchema = z.object({
  cedula: z.string().max(20, 'Cédula no puede tener más de 20 caracteres').min(1, 'Cédula es requerida'),
  telefono: z.string().max(20, 'Teléfono no puede tener más de 20 caracteres').min(1, 'Teléfono es requerido'),
  direccion: z.string().min(1, 'Dirección es requerida'),
  fechaNacimiento: z.string().nullable().optional(),
  fotoPerfil: z.string().nullable().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
