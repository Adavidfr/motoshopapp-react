// src/application/use-cases/notificacion/get-notificacion.use-case.ts
import type { NotificacionRepository } from '../../../domain/ports/notificacion.repository';
export class GetNotificacionUseCase {
  constructor(private readonly repository: NotificacionRepository) {}
  execute(id: number) { return this.repository.getNotificacion(id); }
}
