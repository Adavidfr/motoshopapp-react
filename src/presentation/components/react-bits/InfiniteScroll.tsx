// src/presentation/components/react-bits/InfiniteScroll.tsx
// Auto-scrolling infinite horizontal marquee
import type { ReactNode } from 'react';

interface InfiniteScrollProps {
  children: ReactNode;
  speed?: number; // seconds for one full cycle
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
}

export default function InfiniteScroll({
  children,
  speed = 25,
  direction = 'left',
  pauseOnHover = true,
  className = '',
}: InfiniteScrollProps) {
  const animDir = direction === 'left' ? 'normal' : 'reverse';

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
    >
      <div
        className={`flex w-max gap-8 ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}
        style={{
          animation: `infinite-scroll ${speed}s linear infinite`,
          animationDirection: animDir,
        }}
      >
        {children}
        {/* Duplicate for seamless loop */}
        {children}
      </div>
    </div>
  );
}
