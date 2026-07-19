// src/infrastructure/factories/notificacion.factory.ts
import { ApiNotificacionRepository } from '../adapters/api-notificacion.repository';
import { GetNotificacionesUseCase } from '../../application/use-cases/notificacion/get-notificaciones.use-case';
import { GetNotificacionUseCase } from '../../application/use-cases/notificacion/get-notificacion.use-case';
import { CreateNotificacionUseCase } from '../../application/use-cases/notificacion/create-notificacion.use-case';
import { UpdateNotificacionUseCase } from '../../application/use-cases/notificacion/update-notificacion.use-case';
import { DeleteNotificacionUseCase } from '../../application/use-cases/notificacion/delete-notificacion.use-case';
import { MarcarLeidaUseCase } from '../../application/use-cases/notificacion/marcar-leida.use-case';
import { MarcarTodasLeidasUseCase } from '../../application/use-cases/notificacion/marcar-todas-leidas.use-case';
import { EnviarMasivoUseCase } from '../../application/use-cases/notificacion/enviar-masivo.use-case';

const notificacionRepository = new ApiNotificacionRepository();

export const getNotificacionesUseCase = new GetNotificacionesUseCase(notificacionRepository);
export const getNotificacionUseCase = new GetNotificacionUseCase(notificacionRepository);
export const createNotificacionUseCase = new CreateNotificacionUseCase(notificacionRepository);
export const updateNotificacionUseCase = new UpdateNotificacionUseCase(notificacionRepository);
export const deleteNotificacionUseCase = new DeleteNotificacionUseCase(notificacionRepository);
export const marcarLeidaUseCase = new MarcarLeidaUseCase(notificacionRepository);
export const marcarTodasLeidasUseCase = new MarcarTodasLeidasUseCase(notificacionRepository);
export const enviarMasivoUseCase = new EnviarMasivoUseCase(notificacionRepository);
