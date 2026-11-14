import React from 'react';
import Box from '@mui/material/Box';

interface ArchitecturalDividerProps {
  className?: string;
  variant?: 'light' | 'ivory' | 'dark';
}

/**
 * Signature Architectural Section Divider
 * Powered by Material-UI Box & Geometry with Grounds & Gates Monogram
 */
export const ArchitecturalDivider: React.FC<ArchitecturalDividerProps> = ({
  className = '',
  variant = 'ivory',
}) => {
  const lineBg =
    variant === 'dark'
      ? 'linear-gradient(90deg, transparent, rgba(201, 147, 37, 0.4), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(201, 147, 37, 0.5), transparent)';

  return (
    <Box
      className={className}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 1.5,
        userSelect: 'none',
      }}
      aria-hidden="true"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
          width: '100%',
          maxWidth: 896,
          px: 3,
        }}
      >
        <Box sx={{ flex: 1, height: '1px', background: lineBg }} />
        <Box
          component="svg"
          width="18"
          height="18"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          sx={{ flexShrink: 0, opacity: 0.85 }}
        >
          <path
            d="M0 0H100V20.5H22.7V79.5H72.6V100H0V0Z"
            fill={variant === 'dark' ? '#FFFFFF' : '#013E18'}
          />
          <path
            d="M38.7 40H100V100H79V60.5H38.7V40Z"
            fill="#C99325"
          />
        </Box>
        <Box sx={{ flex: 1, height: '1px', background: lineBg }} />
      </Box>
    </Box>
  );
};
