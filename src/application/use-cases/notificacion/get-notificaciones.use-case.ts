// src/application/use-cases/notificacion/get-notificaciones.use-case.ts
import type { NotificacionRepository, NotificacionFilters } from '../../../domain/ports/notificacion.repository';
export class GetNotificacionesUseCase {
  constructor(private readonly repository: NotificacionRepository) {}
  execute(filters?: NotificacionFilters) { return this.repository.listNotificaciones(filters); }
}
