import type { AxiosError } from 'axios';

type DrfErrorData =
  | string
  | { detail?: string; error?: string; message?: string; detalle?: string }
  | Record<string, string | string[]>;

function formatFieldValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(String).join(', ');
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  return String(value);
}

export function parseApiError(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (typeof error === 'string') return error;

  const axiosError = error as AxiosError<DrfErrorData>;
  const status = axiosError.response?.status;
  const data = axiosError.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data && typeof data === 'object') {
    if ('detail' in data && data.detail) return String(data.detail);
    if ('error' in data && data.error) return String(data.error);
    if ('message' in data && data.message) return String(data.message);
    if ('detalle' in data && data.detalle) return String(data.detalle);

    const fieldMessages = Object.entries(data)
      .filter(([key]) => !['detail', 'error', 'message', 'detalle'].includes(key))
      .map(([key, value]) => `${key}: ${formatFieldValue(value)}`);

    if (fieldMessages.length > 0) {
      return fieldMessages.join(' | ');
    }
  }

  if (status === 401) return 'Sesión expirada. Inicie sesión nuevamente.';
  if (status === 403) return 'No tienes permiso para realizar esta acción.';
  if (status === 404) return 'Recurso no encontrado.';
  if (status === 409) return 'Conflicto: el recurso ya existe o fue modificado.';
  if (status === 500) return 'Error interno del servidor. Intenta más tarde.';

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
