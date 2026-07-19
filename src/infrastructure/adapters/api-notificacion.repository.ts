// src/infrastructure/adapters/api-notificacion.repository.ts
import type { NotificacionRepository, NotificacionFilters, EnviarMasivoPayload } from '../../domain/ports/notificacion.repository';
import type { Notificacion, PaginatedNotificaciones } from '../../domain/entities/notificacion.entity';
import { httpClient } from '../http/axios-client';

export class ApiNotificacionRepository implements NotificacionRepository {
  private map(data: any): Notificacion {
    return {
      id_notificacion: data.id_notificacion,
      id_usuario:      data.id_usuario,
      titulo:          data.titulo,
      mensaje:         data.mensaje,
      leido:           data.leido,
      fecha_creacion:  data.fecha_creacion,
    };
  }

  async listNotificaciones(filters?: NotificacionFilters): Promise<PaginatedNotificaciones> {
    const params: any = {};
    if (filters) {
      if (filters.page)     params.page      = filters.page;
      if (filters.pageSize) params.page_size = filters.pageSize;
      if (filters.search)   params.search    = filters.search;
    }
    const res = await httpClient.get('/notificaciones/', { params });
    return {
      count: res.data.count,
      next: res.data.next,
      previous: res.data.previous,
      results: (res.data.results || []).map((i: any) => this.map(i)),
    };
  }

  async getNotificacion(id: number): Promise<Notificacion> {
    const res = await httpClient.get(`/notificaciones/${id}/`);
    return this.map(res.data);
  }

  async createNotificacion(payload: Omit<Notificacion, 'id_notificacion' | 'leido' | 'fecha_creacion'>): Promise<Notificacion> {
    const res = await httpClient.post('/notificaciones/', payload);
    return this.map(res.data);
  }

  async updateNotificacion(id: number, payload: Partial<Notificacion>): Promise<Notificacion> {
    const res = await httpClient.patch(`/notificaciones/${id}/`, payload);
    return this.map(res.data);
  }

  async deleteNotificacion(id: number): Promise<void> {
    await httpClient.delete(`/notificaciones/${id}/`);
  }

  async marcarLeida(id: number): Promise<void> {
    await httpClient.post(`/notificaciones/${id}/marcar_leida/`);
  }

  async marcarTodasLeidas(): Promise<void> {
    await httpClient.post('/notificaciones/marcar_todas_leidas/');
  }

  async enviarMasivo(payload: EnviarMasivoPayload): Promise<void> {
    await httpClient.post('/notificaciones/enviar_masivo/', payload);
  }
}
