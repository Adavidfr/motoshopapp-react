// src/domain/entities/profile.entity.ts

export interface ClientePerfil {
  idPerfil: number;
  username: string;
  email: string;
  cedula: string;
  telefono: string;
  direccion: string;
  fotoPerfil: string | null;
  fechaNacimiento: string | null;
}
