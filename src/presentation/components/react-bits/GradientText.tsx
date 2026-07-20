// src/presentation/components/react-bits/GradientText.tsx
// Inspired by React Bits - GradientText component (CSS-only version)

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number; // seconds
}

export default function GradientText({
  children,
  className = '',
  colors = ['#ff1a1a', '#ff6b35', '#ff1a1a', '#cc0000', '#ff1a1a'],
  animationSpeed = 4,
}: GradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
    backgroundSize: '300% 100%',
    backgroundClip: 'text' as const,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: `gradient-shift ${animationSpeed}s ease-in-out infinite`,
  };

  return (
    <span className={className} style={gradientStyle}>
      {children}
    </span>
  );
}
