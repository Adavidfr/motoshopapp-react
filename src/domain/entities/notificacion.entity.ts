// src/domain/entities/notificacion.entity.ts

export interface Notificacion {
  id_notificacion: number;
  id_usuario: number;
  titulo: string;
  mensaje: string;
  leido: boolean;
  fecha_creacion: string;
}

export interface PaginatedNotificaciones {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notificacion[];
}
