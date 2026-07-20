// src/presentation/components/react-bits/SplitText.tsx
// Inspired by React Bits - SplitText component (CSS-only version)
import { useEffect, useRef, useState } from 'react';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number; // delay between each letter in ms
  animationFrom?: { opacity: number; transform: string };
  animationTo?: { opacity: number; transform: string };
  threshold?: number;
  onLetterAnimationComplete?: () => void;
}

export default function SplitText({
  text,
  className = '',
  delay = 50,
  animationFrom = { opacity: 0, transform: 'translateY(40px) scale(0.95)' },
  animationTo = { opacity: 1, transform: 'translateY(0) scale(1)' },
  threshold = 0.1,
  onLetterAnimationComplete,
}: SplitTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  useEffect(() => {
    if (isVisible && onLetterAnimationComplete) {
      const totalTime = text.length * delay + 600;
      const timer = setTimeout(onLetterAnimationComplete, totalTime);
      return () => clearTimeout(timer);
    }
  }, [isVisible, text.length, delay, onLetterAnimationComplete]);

  // Split text into words, then each word into letters
  const words = text.split(' ');
  let globalIndex = 0;

  return (
    <span ref={containerRef} className={className} aria-label={text}>
      {words.map((word, wordIdx) => (
        <span key={wordIdx} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
          {word.split('').map((letter) => {
            const idx = globalIndex++;
            return (
              <span
                key={idx}
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  opacity: isVisible ? animationTo.opacity : animationFrom.opacity,
                  transform: isVisible ? animationTo.transform : animationFrom.transform,
                  transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${idx * delay}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${idx * delay}ms`,
                  willChange: 'opacity, transform',
                }}
              >
                {letter}
              </span>
            );
          })}
          {wordIdx < words.length - 1 && (
            <span style={{ display: 'inline-block', width: '0.3em' }}>&nbsp;</span>
          )}
        </span>
      ))}
    </span>
  );
}
