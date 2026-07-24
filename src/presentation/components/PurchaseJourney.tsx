// src/presentation/components/PurchaseJourney.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  {
    step: '01',
    title: 'Elige',
    desc: 'Explora modelos y compara lo que te conviene.',
  },
  {
    step: '02',
    title: 'Confirma',
    desc: 'Precio claro, stock verificado y opciones de pago.',
  },
  {
    step: '03',
    title: 'Recibe',
    desc: 'Coordinamos entrega o retiro con seguimiento.',
  },
] as const;

interface PurchaseJourneyProps {
  intervalMs?: number;
}

/**
 * Pasos de compra con línea roja animada e highlight cíclico.
 */
export default function PurchaseJourney({ intervalMs = 3000 }: PurchaseJourneyProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % STEPS.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  const progress = (active + 1) / STEPS.length;

  return (
    <div className="w-full max-w-4xl">
      {/* Track */}
      <div className="relative mb-7 hidden sm:block px-5">
        <div className="relative h-10 flex items-center justify-between">
          <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2 h-px bg-white/15" />
          <motion.div
            className="absolute left-5 top-1/2 -translate-y-1/2 h-px bg-primary origin-left"
            animate={{ scaleX: progress }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: 'calc(100% - 40px)' }}
          />
          {STEPS.map((item, idx) => {
            const isActive = idx === active;
            return (
              <span
                key={`dot-${item.step}`}
                className={[
                  'relative z-10 flex size-10 items-center justify-center rounded-full border text-[11px] font-bold tracking-wider transition-all duration-500 bg-[#080808]',
                  isActive
                    ? 'border-primary text-primary shadow-[0_0_16px_rgba(214,31,38,0.45)] scale-110'
                    : 'border-white/25 text-white/45',
                ].join(' ')}
              >
                {item.step}
              </span>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
        {STEPS.map((item, idx) => {
          const isActive = idx === active;

          return (
            <div key={item.step} className="relative">
              <p className="sm:hidden text-[11px] font-bold text-primary tracking-widest mb-2">
                {item.step}
              </p>
              <motion.h3
                className={[
                  'font-display text-2xl font-semibold mb-3 transition-colors duration-500',
                  isActive ? 'text-white' : 'text-white/50',
                ].join(' ')}
                animate={isActive ? { opacity: 1 } : { opacity: 0.7 }}
              >
                {item.title}
              </motion.h3>
              <p
                className={[
                  'text-sm leading-relaxed max-w-[240px] transition-colors duration-500',
                  isActive ? 'text-white/65' : 'text-white/35',
                ].join(' ')}
              >
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
