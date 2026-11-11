import React from 'react';

interface LogoProps {
  variant?: 'horizontal' | 'mark-only' | 'stacked' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showTagline = true
}) => {
  // Brand color tokens
  const forestGreen = variant === 'light' ? '#FFFFFF' : '#013E18';
  const gateGold = '#C99325';
  const taglineColor = variant === 'light' ? '#E0AA3E' : '#735213';

  // Sizing styles
  const markSize = {
    sm: 28,
    md: 38,
    lg: 48,
  }[size];

  // The 04A Logo Mark: Architectural Heritage Gate rising from geometric Ground layers
  const LogoMarkSvg = (
    <svg
      width={markSize}
      height={markSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-label="Grounds & Gates Logo Mark"
    >
      {/* Outer Protective Gate Arch */}
      <rect x="8" y="8" width="84" height="84" rx="8" stroke={gateGold} strokeWidth="3" opacity="0.35" />
      
      {/* Foundation / Grounds Terraced Base */}
      <path
        d="M16 82H84M22 75H78M28 68H72"
        stroke={gateGold}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      
      {/* Twin Gate Pillars */}
      <rect x="30" y="32" width="7" height="36" rx="1.5" fill={forestGreen} />
      <rect x="63" y="32" width="7" height="36" rx="1.5" fill={forestGreen} />
      
      {/* Pillar Capital Caps */}
      <rect x="27" y="29" width="13" height="3.5" rx="1" fill={gateGold} />
      <rect x="60" y="29" width="13" height="3.5" rx="1" fill={gateGold} />
      
      {/* Grand Keystone Archway */}
      <path
        d="M33 32C33 21 67 21 67 32"
        stroke={forestGreen}
        strokeWidth="5"
        strokeLinecap="round"
      />
      
      {/* Central Gate Spearhead / Crest */}
      <path
        d="M50 17L53.5 24H46.5L50 17Z"
        fill={gateGold}
      />
      <circle cx="50" cy="27" r="3" fill={gateGold} />
      
      {/* Inner Gate Grille / Spindles */}
      <line x1="43" y1="36" x2="43" y2="68" stroke={gateGold} strokeWidth="2" strokeDasharray="3 2" />
      <line x1="50" y1="33" x2="50" y2="68" stroke={forestGreen} strokeWidth="2.5" />
      <line x1="57" y1="36" x2="57" y2="68" stroke={gateGold} strokeWidth="2" strokeDasharray="3 2" />
    </svg>
  );

  if (variant === 'mark-only') {
    return <div className={`inline-flex items-center ${className}`}>{LogoMarkSvg}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {LogoMarkSvg}
      
      <div className="flex flex-col justify-center">
        <div className="flex items-center tracking-tight leading-none">
          <span
            className="font-extrabold uppercase"
            style={{
              color: forestGreen,
              fontSize: size === 'sm' ? '1.05rem' : size === 'lg' ? '1.5rem' : '1.25rem',
              letterSpacing: '0.04em',
              fontFamily: 'Noto Sans, sans-serif'
            }}
          >
            Grounds
          </span>
          <span
            className="mx-1 font-light"
            style={{
              color: gateGold,
              fontSize: size === 'sm' ? '1.05rem' : size === 'lg' ? '1.5rem' : '1.25rem'
            }}
          >
            &
          </span>
          <span
            className="font-extrabold uppercase"
            style={{
              color: forestGreen,
              fontSize: size === 'sm' ? '1.05rem' : size === 'lg' ? '1.5rem' : '1.25rem',
              letterSpacing: '0.04em',
              fontFamily: 'Noto Sans, sans-serif'
            }}
          >
            Gates
          </span>
        </div>
        
        {showTagline && (
          <span
            className="text-[0.62rem] font-bold tracking-widest uppercase mt-0.5"
            style={{
              color: taglineColor,
              letterSpacing: '0.12em',
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
