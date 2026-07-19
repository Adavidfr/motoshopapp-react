// src/application/use-cases/notificacion/marcar-leida.use-case.ts
import type { NotificacionRepository } from '../../../domain/ports/notificacion.repository';
export class MarcarLeidaUseCase {
  constructor(private readonly repository: NotificacionRepository) {}
  execute(id: number) { return this.repository.marcarLeida(id); }
}
