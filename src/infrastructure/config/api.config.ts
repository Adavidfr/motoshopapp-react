const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

export const API_CONFIG = {
  BASE_URL: apiBaseUrl,
  MEDIA_BASE_URL: apiBaseUrl.replace(/\/api\/?$/, ''),
  TIMEOUT: 10_000,
} as const;

/** Convierte rutas relativas de media (/media/...) en URL absoluta local. */
export function resolveMediaUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = API_CONFIG.MEDIA_BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
