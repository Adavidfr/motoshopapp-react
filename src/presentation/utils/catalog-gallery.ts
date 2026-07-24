/**
 * Galería editorial desde public/motos/
 * Rutas estáticas servidas por Vite.
 */
const CATALOG_GALLERY_FILES = [
  'imagen1.png',
  'imagen2.png',
  'imagen3.png',
  'Suzuki-Katana-2019-5.jpg',
  '5c1845481650655a69c2d00c2c783aeb.jpg',
] as const;

export function getCatalogGalleryImages(): string[] {
  return CATALOG_GALLERY_FILES.map(
    (file) => `/motos/${encodeURIComponent(file)}`,
  );
}

/** Imagen de producto o fallback cíclico de la galería local. */
export function resolveMotoImage(
  primary: string | null | undefined,
  index: number,
  gallery: string[] = getCatalogGalleryImages(),
): string {
  if (primary) return primary;
  if (gallery.length === 0) return '';
  return gallery[index % gallery.length];
}
