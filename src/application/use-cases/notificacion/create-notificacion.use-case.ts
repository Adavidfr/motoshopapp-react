// src/application/use-cases/notificacion/create-notificacion.use-case.ts
import type { NotificacionRepository } from '../../../domain/ports/notificacion.repository';
import type { Notificacion } from '../../../domain/entities/notificacion.entity';
export class CreateNotificacionUseCase {
  private repository: NotificacionRepository;
  constructor(r: NotificacionRepository) { this.repository = r; }
  execute(payload: Omit<Notificacion, 'id_notificacion' | 'leido' | 'fecha_creacion'>) { return this.repository.createNotificacion(payload); }
}
