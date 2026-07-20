// src/presentation/components/react-bits/BrandTicker.tsx
// Fully self-contained brand ticker using pure CSS – zero external dependencies.
// Uses data-URLs and brand text so it NEVER shows broken images.

interface Brand {
  name: string;
  color: string;
  letter: string;
}

const BRANDS: Brand[] = [
  { name: 'Yamaha',   color: '#1C2B6E', letter: 'Y' },
  { name: 'Honda',    color: '#CC0000', letter: 'H' },
  { name: 'Kawasaki', color: '#1D9634', letter: 'K' },
  { name: 'Suzuki',   color: '#1B50A4', letter: 'S' },
  { name: 'Ducati',   color: '#CC0000', letter: 'D' },
  { name: 'BMW',      color: '#0066CC', letter: 'B' },
  { name: 'KTM',      color: '#FF6600', letter: 'K' },
  { name: 'Triumph',  color: '#CCAA00', letter: 'T' },
  { name: 'Harley',   color: '#FF8200', letter: 'H' },
  { name: 'Royal Enfield', color: '#8B1A1A', letter: 'R' },
];

interface BrandTickerProps {
  speed?: number;
  className?: string;
}

export default function BrandTicker({ speed = 28, className = '' }: BrandTickerProps) {
  // Duplicate the list for seamless loop
  const items = [...BRANDS, ...BRANDS];

  return (
    <div
      className={`overflow-hidden ${className}`}
      aria-label="Marcas disponibles"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}
    >
      <div
        className="flex w-max items-center"
        style={{ animation: `infinite-scroll ${speed}s linear infinite` }}
      >
        {items.map((brand, idx) => (
          <div
            key={`${brand.name}-${idx}`}
            className="flex items-center gap-3 px-8 py-5 group cursor-default select-none shrink-0 transition-all duration-300"
          >
            {/* Brand monogram badge */}
            <div
              className="size-9 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
              style={{
                background: `linear-gradient(135deg, ${brand.color}CC, ${brand.color}66)`,
                border: `1px solid ${brand.color}40`,
                boxShadow: `0 0 12px ${brand.color}20`,
              }}
            >
              {brand.letter}
            </div>

            {/* Separator dot */}
            <div
              className="size-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: brand.color }}
            />

            {/* Brand name */}
            <span
              className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-700 group-hover:text-neutral-200 transition-colors duration-500 whitespace-nowrap"
            >
              {brand.name}
            </span>

            {/* Right divider */}
            <div className="w-[1px] h-5 bg-white/[0.05] ml-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
