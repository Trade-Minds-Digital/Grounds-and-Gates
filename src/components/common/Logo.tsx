import React from 'react';
import { motion } from 'motion/react';

export interface LogoProps {
  variant?: 'horizontal' | 'mark-only' | 'stacked' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTagline?: boolean;
  animateEntrance?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showTagline = true,
  animateEntrance = false
}) => {
  // Brand color tokens
  const forestGreen = variant === 'light' ? '#FFFFFF' : '#013E18';
  const gateGold = '#C99325';
  const taglineColor = variant === 'light' ? '#F5F2E9' : '#013E18';

  // Sizing styles
  const markSize = {
    sm: 28,
    md: 36,
    lg: 48,
  }[size];

  // The official Grounds and Gates 04A Monogram: Architectural Interlocking "G"
  const LogoMarkSvg = (
    <svg
      width={markSize}
      height={markSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-label="Grounds and Gates Logo Mark"
    >
      {/* Forest Green Outer Frame: Top bar, vertical left column, and bottom base */}
      <motion.path
        initial={animateEntrance ? { opacity: 0, x: -6 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        d="M0 0H100V20.5H22.7V79.5H72.6V100H0V0Z"
        fill={forestGreen}
      />
      {/* Gate Gold Interlocking Center Crossbar & Right Column */}
      <motion.path
        initial={animateEntrance ? { opacity: 0, x: 6 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        d="M38.7 40H100V100H79V60.5H38.7V40Z"
        fill={gateGold}
      />
    </svg>
  );

  if (variant === 'mark-only') {
    return <div className={`inline-flex items-center shrink-0 ${className}`}>{LogoMarkSvg}</div>;
  }

  if (variant === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-center text-center gap-2 select-none shrink-0 group ${className}`}>
        {LogoMarkSvg}
        <div className="flex flex-col items-center whitespace-nowrap shrink-0">
          <span
            className="font-extrabold tracking-tight leading-none whitespace-nowrap"
            style={{
              color: forestGreen,
              fontSize: size === 'sm' ? '1.05rem' : size === 'lg' ? '1.5rem' : '1.25rem',
              letterSpacing: '-0.02em',
              fontFamily: 'Noto Sans, sans-serif'
            }}
          >
            Grounds and Gates
          </span>
          {showTagline && (
            <span
              className="font-semibold leading-tight mt-1 whitespace-nowrap"
              style={{
                color: taglineColor,
                fontSize: size === 'sm' ? '0.58rem' : size === 'lg' ? '0.78rem' : '0.66rem',
                letterSpacing: '0.01em',
                fontFamily: 'Noto Sans, sans-serif'
              }}
            >
              Property Decisions Simplified
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none shrink-0 group ${className}`}>
      {LogoMarkSvg}
      
      <div className="flex flex-col justify-center whitespace-nowrap shrink-0">
        <span
          className="font-extrabold tracking-tight leading-none whitespace-nowrap"
          style={{
            color: forestGreen,
            fontSize: size === 'sm' ? '1.02rem' : size === 'lg' ? '1.55rem' : '1.25rem',
            letterSpacing: '-0.02em',
            fontFamily: 'Noto Sans, sans-serif'
          }}
        >
          Grounds and Gates
        </span>
        
        {showTagline && (
          <span
            className="font-semibold leading-tight mt-1 opacity-95 whitespace-nowrap"
            style={{
              color: taglineColor,
              fontSize: size === 'sm' ? '0.58rem' : size === 'lg' ? '0.78rem' : '0.66rem',
              letterSpacing: '0.01em',
              fontFamily: 'Noto Sans, sans-serif'
            }}
          >
            Property Decisions Simplified
          </span>
        )}
      </div>
    </div>
  );
};

