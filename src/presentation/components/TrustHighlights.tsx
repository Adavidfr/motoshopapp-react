// src/presentation/components/TrustHighlights.tsx
import { useEffect, useState, type ElementType } from 'react';

export interface TrustHighlightItem {
  icon: ElementType;
  title: string;
  hint: string;
}

interface TrustHighlightsProps {
  items: TrustHighlightItem[];
  /** ms que cada ítem mantiene la rayita girando */
  intervalMs?: number;
}

/**
 * Barra de confianza: la rayita roja gira sola, un ítem a la vez.
 */
export default function TrustHighlights({
  items,
  intervalMs = 2800,
}: TrustHighlightsProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % items.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [items.length, intervalMs]);

  return (
    <div className="w-full bg-[#080808]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const isActive = idx === active;

          return (
            <div
              key={item.title}
              className={[
                'flex items-center gap-3.5 px-4 sm:px-5 lg:px-5 py-6 lg:py-7',
                idx > 0 ? 'border-t border-white/[0.08] sm:border-t-0' : '',
                idx % 2 === 1 ? 'sm:border-l sm:border-white/[0.08]' : '',
                idx > 0 ? 'lg:border-l lg:border-white/[0.08]' : '',
                idx >= 2 ? 'sm:border-t sm:border-white/[0.08] lg:border-t-0' : '',
              ].join(' ')}
            >
              <span className="relative flex size-14 shrink-0 items-center justify-center">
                <svg
                  className={[
                    'absolute inset-0 size-full',
                    isActive ? 'animate-[trust-ring-spin_2.2s_linear_infinite]' : '',
                  ].join(' ')}
                  viewBox="0 0 56 56"
                  aria-hidden
                >
                  <circle
                    cx="28"
                    cy="28"
                    r="25"
                    fill="none"
                    stroke="rgba(255,255,255,0.14)"
                    strokeWidth="1.25"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="25"
                    fill="none"
                    stroke="#D61F26"
                    strokeWidth="1.85"
                    strokeLinecap="round"
                    strokeDasharray="32 140"
                  />
                </svg>
                <Icon className="relative size-6 text-white" strokeWidth={1.5} />
              </span>

              <div className="min-w-0 space-y-0.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white leading-snug">
                  {item.title}
                </p>
                <p className="text-[11px] text-white/45 leading-snug">{item.hint}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
