// src/presentation/components/react-bits/Magnet.tsx
// Inspired by React Bits - Magnet component (CSS-only version)
import { useRef, useState } from 'react';

interface MagnetProps {
  children: React.ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  className?: string;
}

export default function Magnet({
  children,
  padding = 60,
  disabled = false,
  magnetStrength = 0.35,
  className = '',
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('translate(0px, 0px)');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * magnetStrength;
    const deltaY = (e.clientY - centerY) * magnetStrength;
    setTransform(`translate(${deltaX}px, ${deltaY}px)`);
  };

  const handleMouseLeave = () => {
    setTransform('translate(0px, 0px)');
  };

  return (
    <div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ padding: `${padding}px`, margin: `-${padding}px` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        style={{
          transform,
          transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
}
