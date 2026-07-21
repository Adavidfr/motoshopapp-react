// src/presentation/components/react-bits/BrandTicker.tsx
import { motion } from 'framer-motion';

const BRANDS = [
  { name: 'Ducati', logo: 'https://cdn.simpleicons.org/ducati/white' },
  { name: 'Yamaha', logo: 'https://cdn.simpleicons.org/yamahamotorcorporation/white' },
  { name: 'Kawasaki', logo: '/logos/kawasaki.svg' },
  { name: 'BMW', logo: 'https://cdn.simpleicons.org/bmw/white' },
  { name: 'Honda', logo: 'https://cdn.simpleicons.org/honda/white' },
];

interface BrandTickerProps {
  speed?: number;
  className?: string;
}

export default function BrandTicker({ speed = 25, className = '' }: BrandTickerProps) {
  // Duplicate for seamless infinite loop
  const items = [...BRANDS, ...BRANDS, ...BRANDS];

  return (
    <div
      className={`overflow-hidden flex items-center py-10 ${className}`}
      aria-label="Marcas disponibles"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
      }}
    >
      <motion.div
        className="flex w-max items-center"
        animate={{ x: ["0%", "-33.333333%"] }}
        transition={{ ease: "linear", duration: speed, repeat: Infinity }}
      >
        {items.map((brand, idx) => (
          <div
            key={`${brand.name}-${idx}`}
            className="flex items-center justify-center w-[250px] shrink-0 opacity-40 hover:opacity-100 transition-opacity duration-500 grayscale hover:grayscale-0 cursor-pointer"
          >
            <img 
              src={brand.logo} 
              alt={brand.name} 
              className="h-20 w-auto object-contain pointer-events-none drop-shadow-2xl brightness-0 dark:invert transition-all duration-500" 
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
