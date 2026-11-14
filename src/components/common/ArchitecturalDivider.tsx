import React from 'react';

interface ArchitecturalDividerProps {
  className?: string;
  variant?: 'light' | 'ivory' | 'dark';
}

/**
 * Signature Architectural Section Divider
 * Echoes the interlocking horizontal lines and precision geometry of the 04A brand monogram.
 */
export const ArchitecturalDivider: React.FC<ArchitecturalDividerProps> = ({
  className = '',
  variant = 'ivory',
}) => {
  const lineBg =
    variant === 'dark'
      ? 'from-transparent via-[#C99325]/40 to-transparent'
      : 'from-transparent via-[#C99325]/50 to-transparent';

  return (
    <div className={`w-full flex items-center justify-center py-2 select-none ${className}`} aria-hidden="true">
      <div className="w-full max-w-4xl mx-auto flex items-center gap-4 px-6">
        <div className={`h-px flex-1 bg-gradient-to-r ${lineBg}`} />
        <svg
          width="18"
          height="18"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 opacity-85"
        >
          <path
            d="M0 0H100V20.5H22.7V79.5H72.6V100H0V0Z"
            fill={variant === 'dark' ? '#FFFFFF' : '#013E18'}
          />
          <path
            d="M38.7 40H100V100H79V60.5H38.7V40Z"
            fill="#C99325"
          />
        </svg>
        <div className={`h-px flex-1 bg-gradient-to-r ${lineBg}`} />
      </div>
    </div>
  );
};
