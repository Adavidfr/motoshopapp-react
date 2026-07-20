// src/application/use-cases/notificacion/marcar-todas-leidas.use-case.ts
import type { NotificacionRepository } from '../../../domain/ports/notificacion.repository';
export class MarcarTodasLeidasUseCase {
  constructor(private readonly repository: NotificacionRepository) {}
  execute() { return this.repository.marcarTodasLeidas(); }
}
