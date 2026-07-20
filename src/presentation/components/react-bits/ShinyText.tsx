// src/presentation/components/react-bits/ShinyText.tsx
// Inspired by React Bits - ShinyText component (CSS-only version)

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number; // animation duration in seconds
  className?: string;
}

export default function ShinyText({
  text,
  disabled = false,
  speed = 3,
  className = '',
}: ShinyTextProps) {
  return (
    <span
      className={`shiny-text ${className}`}
      style={{
        backgroundSize: '250% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: disabled ? 'none' : `shiny-slide ${speed}s linear infinite`,
        backgroundImage:
          'linear-gradient(120deg, rgba(255,255,255,0.65) 40%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.65) 60%)',
      }}
    >
      {text}
    </span>
  );
}
