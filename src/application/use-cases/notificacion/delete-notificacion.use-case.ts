// src/application/use-cases/notificacion/delete-notificacion.use-case.ts
import type { NotificacionRepository } from '../../../domain/ports/notificacion.repository';
export class DeleteNotificacionUseCase {
  constructor(private readonly repository: NotificacionRepository) {}
  execute(id: number) { return this.repository.deleteNotificacion(id); }
}
