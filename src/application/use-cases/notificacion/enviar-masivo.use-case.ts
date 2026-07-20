// src/application/use-cases/notificacion/enviar-masivo.use-case.ts
import type { NotificacionRepository, EnviarMasivoPayload } from '../../../domain/ports/notificacion.repository';
export class EnviarMasivoUseCase {
  constructor(private readonly repository: NotificacionRepository) {}
  execute(payload: EnviarMasivoPayload) { return this.repository.enviarMasivo(payload); }
}
