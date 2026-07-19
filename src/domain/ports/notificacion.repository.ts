// src/domain/ports/notificacion.repository.ts
import type { Notificacion, PaginatedNotificaciones } from '../entities/notificacion.entity';

export interface NotificacionFilters {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface EnviarMasivoPayload {
  titulo: string;
  mensaje: string;
  usuarios?: number[];
}

export interface NotificacionRepository {
  listNotificaciones(filters?: NotificacionFilters): Promise<PaginatedNotificaciones>;
  getNotificacion(id: number): Promise<Notificacion>;
  createNotificacion(payload: Omit<Notificacion, 'id_notificacion' | 'leido' | 'fecha_creacion'>): Promise<Notificacion>;
  updateNotificacion(id: number, payload: Partial<Notificacion>): Promise<Notificacion>;
  deleteNotificacion(id: number): Promise<void>;
  
  marcarLeida(id: number): Promise<void>;
  marcarTodasLeidas(): Promise<void>;
  enviarMasivo(payload: EnviarMasivoPayload): Promise<void>;
}
