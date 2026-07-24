/**
 * Videos del hero detectados en public/videos/.
 * Rutas estáticas servidas por Vite desde /public.
 */
const DETECTED_HERO_VIDEO_FILES = [
  'Video moto primer.mp4',
  'Video moto segunda.mp4',
] as const;

/** URLs listas para <video src>, con espacios codificados. */
export function getHeroVideos(): string[] {
  return DETECTED_HERO_VIDEO_FILES.map(
    (file) => `/videos/${encodeURIComponent(file)}`,
  );
}
