// src/application/use-cases/notificacion/get-notificacion.use-case.ts
import type { NotificacionRepository } from '../../../domain/ports/notificacion.repository';
export class GetNotificacionUseCase {
  private repository: NotificacionRepository;
  constructor(r: NotificacionRepository) { this.repository = r; }
  execute(id: number) { return this.repository.getNotificacion(id); }
}
