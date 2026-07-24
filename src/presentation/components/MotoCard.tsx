// src/presentation/components/MotoCard.tsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import { resolveMotoImage, getCatalogGalleryImages } from '../utils/catalog-gallery';
import type { Moto } from '../../domain/entities/moto.entity';
import type { Variants } from 'framer-motion';

const GALLERY = getCatalogGalleryImages();

interface MotoCardProps {
  moto: Moto;
  index?: number;
  variants?: Variants;
}

export default function MotoCard({ moto, index = 0, variants }: MotoCardProps) {
  const imageSrc = resolveMotoImage(moto.imagen, index, GALLERY);

  return (
    <motion.article variants={variants}>
      <Link
        to={`/products/${moto.idMoto}`}
        className="group block outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
      >
        <div className="overflow-hidden border border-white/10 bg-[#111] transition-colors duration-300 group-hover:border-white/25">
          <div className="relative aspect-[16/10] bg-[#0c0c0c]">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={moto.modelo}
                className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 group-hover:opacity-90"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-white/30">
                Sin imagen
              </div>
            )}
          </div>

          <div className="space-y-2.5 border-t border-white/10 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-white/45">
                {moto.anio}
                {moto.marca ? ` · ${moto.marca}` : ''}
              </p>
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center border border-white/15 bg-white/5 text-white/70 transition-colors duration-300 group-hover:border-white/25 group-hover:bg-white/10 group-hover:text-white"
              >
                <ArrowUpRight className="size-4" strokeWidth={1.75} />
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-3">
              <h3 className="min-w-0 truncate font-display text-lg font-semibold tracking-tight tabular-nums lining-nums text-white [font-feature-settings:'lnum'_1]">
                {moto.modelo}
              </h3>
              <p className="shrink-0 text-base font-semibold tabular-nums text-white">
                {formatPrice(moto.precio)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
