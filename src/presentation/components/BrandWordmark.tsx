// src/presentation/components/BrandWordmark.tsx
interface BrandWordmarkProps {
  className?: string;
  /** Compact nav vs larger footer/hero */
  size?: 'sm' | 'md' | 'lg';
  /** Separar AURA y RIDER como en el logo espaciado */
  spaced?: boolean;
}

/**
 * Wordmark Aura Rider — sans geométrica, mayúsculas, ambas palabras en blanco.
 */
export default function BrandWordmark({
  className = '',
  size = 'sm',
  spaced = true,
}: BrandWordmarkProps) {
  const sizeClass =
    size === 'lg'
      ? 'text-xl sm:text-2xl tracking-[0.3em]'
      : size === 'md'
        ? 'text-xs tracking-[0.24em]'
        : 'text-[11px] tracking-[0.22em]';

  return (
    <span
      className={`font-brand font-medium uppercase leading-none text-white ${sizeClass} ${className}`}
      aria-label="Aura Rider"
    >
      <span>Aura</span>
      {spaced ? <span className="inline-block w-[0.45em]" aria-hidden /> : null}
      <span>Rider</span>
    </span>
  );
}
