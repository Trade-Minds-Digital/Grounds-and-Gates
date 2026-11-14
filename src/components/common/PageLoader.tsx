import React from 'react';
import { motion } from 'motion/react';
import Box from '@mui/material/Box';

export interface PageLoaderProps {
  /** If true, fills the entire viewport with an overlay backdrop */
  fullScreen?: boolean;
  /** Size of the icon in pixels (default: 64) */
  size?: number;
  className?: string;
}

/**
 * Minimalist luxury page loader showcasing ONLY the official Grounds & Gates architectural monogram
 * with a continuous luxury breathing animation and gold ambient aura.
 */
export const PageLoader: React.FC<PageLoaderProps> = ({
  fullScreen = false,
  size = 64,
  className = ''
}) => {
  return (
    <Box
      role="status"
      aria-label="Loading"
      aria-busy="true"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...(fullScreen
          ? {
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              bgcolor: 'rgba(250, 248, 242, 0.96)',
              backdropFilter: 'blur(8px)',
            }
          : {
              minHeight: '65vh',
              width: '100%',
              bgcolor: 'transparent',
            }),
      }}
      className={className}
    >
      <div className="relative flex items-center justify-center">
        {/* Soft Golden Ambient Radial Aura */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.35, 0.7, 0.35],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            width: size * 2.2,
            height: size * 2.2,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201, 147, 37, 0.28) 0%, rgba(1, 62, 24, 0.08) 50%, transparent 72%)',
            pointerEvents: 'none',
          }}
        />

        {/* Outer Gentle Pulse Ring */}
        <motion.div
          animate={{
            scale: [0.95, 1.12, 0.95],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.15,
          }}
          style={{
            position: 'absolute',
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: '50%',
            border: '1.5px solid rgba(201, 147, 37, 0.3)',
            pointerEvents: 'none',
          }}
        />

        {/* Monogram Icon Container with Continuous Luxury Animation */}
        <motion.div
          animate={{
            scale: [0.94, 1.04, 0.94],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1],
          }}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: 'drop-shadow(0 6px 16px rgba(1, 62, 24, 0.18))',
            }}
          >
            {/* Forest Green Frame with Subtle Shimmer */}
            <motion.path
              animate={{
                opacity: [0.9, 1, 0.9],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              d="M0 0H100V20.5H22.7V79.5H72.6V100H0V0Z"
              fill="#013E18"
            />

            {/* Heritage Gate Gold Interlocking Monogram Key with Subtle Shift */}
            <motion.path
              animate={{
                opacity: [0.85, 1, 0.85],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.2,
              }}
              d="M38.7 40H100V100H79V60.5H38.7V40Z"
              fill="#C99325"
            />
          </svg>
        </motion.div>
      </div>

      <span className="sr-only">Loading Grounds and Gates...</span>
    </Box>
  );
};
