// src/presentation/components/react-bits/CountUp.tsx
// Inspired by React Bits - CountUp component (CSS-only version)
import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  from?: number;
  to: number;
  duration?: number; // in ms
  separator?: string;
  suffix?: string;
  prefix?: string;
  className?: string;
  threshold?: number;
}

export default function CountUp({
  from = 0,
  to,
  duration = 2000,
  separator = ',',
  suffix = '',
  prefix = '',
  className = '',
  threshold = 0.3,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(from);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const startTime = performance.now();
    const range = to - from;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for a decelerating feel
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + range * eased);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [hasStarted, from, to, duration]);

  const formatted = count
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
