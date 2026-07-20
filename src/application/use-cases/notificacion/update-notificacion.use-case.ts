// src/application/use-cases/notificacion/update-notificacion.use-case.ts
import type { NotificacionRepository } from '../../../domain/ports/notificacion.repository';
import type { Notificacion } from '../../../domain/entities/notificacion.entity';
export class UpdateNotificacionUseCase {
  private repository: NotificacionRepository;
  constructor(r: NotificacionRepository) { this.repository = r; }
  execute(id: number, payload: Partial<Notificacion>) { return this.repository.updateNotificacion(id, payload); }
}
