// src/application/use-cases/notificacion/delete-notificacion.use-case.ts
import type { NotificacionRepository } from '../../../domain/ports/notificacion.repository';
export class DeleteNotificacionUseCase {
  private repository: NotificacionRepository;
  constructor(r: NotificacionRepository) { this.repository = r; }
  execute(id: number) { return this.repository.deleteNotificacion(id); }
}
