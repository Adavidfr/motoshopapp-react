// src/presentation/components/HeroVideoCarousel.tsx
import { useEffect, useRef, useState } from 'react';
import { getHeroVideos } from '../utils/hero-videos';

interface HeroVideoCarouselProps {
  className?: string;
  maxDurationMs?: number;
}

/**
 * Carrusel cinematográfico: autoplay, muted, playsInline, fade, sin controles.
 * Fuentes: public/videos/ (detectadas en getHeroVideos).
 */
export default function HeroVideoCarousel({
  className = '',
  maxDurationMs = 22000,
}: HeroVideoCarouselProps) {
  const videos = getHeroVideos();
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    if (videos.length === 0) return;

    refs.current.forEach((el, i) => {
      if (!el) return;
      if (i === active) {
        el.currentTime = 0;
        void el.play().catch(() => undefined);
      } else {
        el.pause();
      }
    });

    const fallback = window.setTimeout(() => {
      setActive((prev) => (prev + 1) % videos.length);
    }, maxDurationMs);

    return () => window.clearTimeout(fallback);
  }, [active, maxDurationMs, videos.length]);

  if (videos.length === 0) {
    return <div className={`absolute inset-0 bg-[#080808] ${className}`} aria-hidden />;
  }

  return (
    <div className={`absolute inset-0 overflow-hidden bg-[#080808] ${className}`} aria-hidden>
      {videos.map((src, i) => (
        <video
          key={src}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            i === active ? 'opacity-100' : 'opacity-0'
          }`}
          src={src}
          muted
          playsInline
          autoPlay={i === active}
          preload="auto"
          onEnded={() => {
            if (i === active) setActive((prev) => (prev + 1) % videos.length);
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-[#080808]/30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/50 pointer-events-none" />

      <div className="absolute left-5 sm:left-10 top-1/2 -translate-y-1/2 z-[3] hidden md:flex flex-col gap-4 font-sans text-[10px] tracking-[0.3em] text-white/35">
        {videos.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(i)}
            className={`text-left transition-colors duration-500 ${
              i === active ? 'text-white' : 'hover:text-white/70'
            }`}
            aria-label={`Video ${i + 1}`}
          >
            {String(i + 1).padStart(2, '0')}
          </button>
        ))}
      </div>
    </div>
  );
}
