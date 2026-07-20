// src/application/use-cases/notificacion/marcar-todas-leidas.use-case.ts
import type { NotificacionRepository } from '../../../domain/ports/notificacion.repository';
export class MarcarTodasLeidasUseCase {
  private repository: NotificacionRepository;
  constructor(r: NotificacionRepository) { this.repository = r; }
  execute() { return this.repository.marcarTodasLeidas(); }
}
