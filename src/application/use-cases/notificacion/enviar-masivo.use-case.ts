// src/application/use-cases/notificacion/enviar-masivo.use-case.ts
import type { NotificacionRepository, EnviarMasivoPayload } from '../../../domain/ports/notificacion.repository';
export class EnviarMasivoUseCase {
  private repository: NotificacionRepository;
  constructor(r: NotificacionRepository) { this.repository = r; }
  execute(payload: EnviarMasivoPayload) { return this.repository.enviarMasivo(payload); }
}
