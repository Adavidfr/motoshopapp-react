import type { Moto } from '../../domain/entities/moto.entity';
import {
  MOTO_ESTADO_DISPONIBLE,
  MOTO_ESTADOS,
  type MotoEstado,
  normalizeMotoEstadoForForm,
} from '../../domain/entities/moto.entity';

export {
  MOTO_ESTADO_DISPONIBLE,
  MOTO_ESTADOS,
  type MotoEstado,
  normalizeMotoEstadoForForm,
};

/**
 * No existe campo disponibilidad_local en el modelo Moto.
 * Django valida: moto.estado === 'disponible' (minúsculas) y stock > 0.
 */
export function isMotoEstadoDisponible(estado: string): boolean {
  return estado === MOTO_ESTADO_DISPONIBLE;
}

export function isMotoAvailableForPurchase(moto: Pick<Moto, 'estado' | 'stock'>): boolean {
  return isMotoEstadoDisponible(moto.estado) && moto.stock > 0;
}

export interface MotoAvailabilityInfo {
  isAvailable: boolean;
  localLabel: string;
  unavailableHint: string | null;
  buttonLabel: string;
}

export function getMotoAvailabilityInfo(moto: Pick<Moto, 'estado' | 'stock'>): MotoAvailabilityInfo {
  const hasStock = moto.stock > 0;
  const estadoExacto = isMotoEstadoDisponible(moto.estado);
  const estadoNormalizado = moto.estado.trim().toLowerCase();
  const caseMismatchDisponible =
    hasStock && estadoNormalizado === MOTO_ESTADO_DISPONIBLE && !estadoExacto;

  if (estadoExacto && hasStock) {
    return {
      isAvailable: true,
      localLabel: `${moto.stock} unidades`,
      unavailableHint: null,
      buttonLabel: 'Agregar al Carrito',
    };
  }

  if (caseMismatchDisponible) {
    return {
      isAvailable: false,
      localLabel: 'Stock existente, pero no disponible para compra',
      unavailableHint:
        'El estado debe registrarse como «disponible» (minúsculas) para habilitar la venta en línea.',
      buttonLabel: 'No disponible',
    };
  }

  if (!hasStock) {
    return {
      isAvailable: false,
      localLabel: 'Sin stock',
      unavailableHint: null,
      buttonLabel: 'Agotado',
    };
  }

  if (estadoNormalizado === 'vendida') {
    return {
      isAvailable: false,
      localLabel: 'Vendida',
      unavailableHint: null,
      buttonLabel: 'No disponible',
    };
  }

  if (estadoNormalizado === 'reservada') {
    return {
      isAvailable: false,
      localLabel: 'Reservada',
      unavailableHint: null,
      buttonLabel: 'No disponible',
    };
  }

  return {
    isAvailable: false,
    localLabel: 'No disponible para compra',
    unavailableHint: null,
    buttonLabel: 'No disponible',
  };
}

export function formatMotoEstadoLabel(estado: string): string {
  const trimmed = estado.trim();
  if (!trimmed) {
    return trimmed;
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}
