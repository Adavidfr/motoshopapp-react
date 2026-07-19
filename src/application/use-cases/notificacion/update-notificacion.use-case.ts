// src/application/use-cases/notificacion/update-notificacion.use-case.ts
import type { NotificacionRepository } from '../../../domain/ports/notificacion.repository';
import type { Notificacion } from '../../../domain/entities/notificacion.entity';
export class UpdateNotificacionUseCase {
  constructor(private readonly repository: NotificacionRepository) {}
  execute(id: number, payload: Partial<Notificacion>) { return this.repository.updateNotificacion(id, payload); }
}
