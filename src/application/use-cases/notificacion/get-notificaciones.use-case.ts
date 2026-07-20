// src/application/use-cases/notificacion/get-notificaciones.use-case.ts
import type { NotificacionRepository, NotificacionFilters } from '../../../domain/ports/notificacion.repository';
export class GetNotificacionesUseCase {
  private repository: NotificacionRepository;
  constructor(r: NotificacionRepository) { this.repository = r; }
  execute(filters?: NotificacionFilters) { return this.repository.listNotificaciones(filters); }
}
