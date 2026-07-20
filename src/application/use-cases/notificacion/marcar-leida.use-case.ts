// src/application/use-cases/notificacion/marcar-leida.use-case.ts
import type { NotificacionRepository } from '../../../domain/ports/notificacion.repository';
export class MarcarLeidaUseCase {
  private repository: NotificacionRepository;
  constructor(r: NotificacionRepository) { this.repository = r; }
  execute(id: number) { return this.repository.marcarLeida(id); }
}
