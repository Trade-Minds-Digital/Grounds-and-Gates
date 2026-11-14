import React from 'react';
import MuiSkeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

export interface SkeletonProps {
  variant?: 'rectangular' | 'rounded' | 'circular' | 'text';
  animation?: 'wave' | 'pulse' | false;
  className?: string;
  width?: number | string;
  height?: number | string;
  sx?: any;
}

/**
 * Base Skeleton component powered by MUI Skeleton with Grounds & Gates ivory warmth styling.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rounded',
  animation = 'wave',
  className = '',
  width,
  height,
  sx,
  ...props
}) => {
  return (
    <MuiSkeleton
      variant={variant}
      animation={animation}
      width={width}
      height={height}
      className={className}
      sx={{
        bgcolor: 'rgba(235, 230, 218, 0.65)',
        ...sx,
      }}
      {...props}
    />
  );
};

export interface PropertyCardSkeletonProps {
  layout?: 'grid' | 'list';
  className?: string;
}

/**
 * Property Card Skeleton matching the exact layout of PropertyCard.tsx using MUI.
 */
export const PropertyCardSkeleton: React.FC<PropertyCardSkeletonProps> = ({
  layout = 'grid',
  className = ''
}) => {
  if (layout === 'list') {
    return (
      <Card
        className={className}
        sx={{
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: '1px solid rgba(24, 36, 27, 0.08)',
          boxShadow: '0 2px 10px rgba(24, 36, 27, 0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
        }}
        aria-hidden="true"
      >
        {/* Left Thumbnail Placeholder */}
        <Box
          sx={{
            position: 'relative',
            width: { xs: '100%', md: 320 },
            height: { xs: 220, md: 'auto' },
            flexShrink: 0,
            bgcolor: 'rgba(235, 230, 218, 0.5)',
          }}
        >
          <MuiSkeleton variant="rectangular" width="100%" height="100%" animation="wave" sx={{ bgcolor: 'rgba(235, 230, 218, 0.7)' }} />
          <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1 }}>
            <MuiSkeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 1.5 }} />
            <MuiSkeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 1.5 }} />
          </Box>
          <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
            <MuiSkeleton variant="circular" width={32} height={32} />
            <MuiSkeleton variant="circular" width={32} height={32} />
          </Box>
        </Box>

        {/* Content Placeholder */}
        <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <MuiSkeleton variant="rounded" width={100} height={16} />
              <MuiSkeleton variant="rounded" width={70} height={14} />
            </Box>

            <MuiSkeleton variant="rounded" width="80%" height={24} sx={{ mb: 1.5 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <MuiSkeleton variant="circular" width={16} height={16} />
              <MuiSkeleton variant="rounded" width={180} height={16} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, my: 2 }}>
              <MuiSkeleton variant="rounded" width="100%" height={12} />
              <MuiSkeleton variant="rounded" width="85%" height={12} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1.5, py: 1.5, borderTop: '1px solid #F0ECE1', borderBottom: '1px solid #F0ECE1' }}>
              <MuiSkeleton variant="rounded" height={20} />
              <MuiSkeleton variant="rounded" height={20} />
              <MuiSkeleton variant="rounded" height={20} />
              <MuiSkeleton variant="rounded" height={20} />
            </Box>
          </div>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, mt: 1 }}>
            <div>
              <MuiSkeleton variant="rounded" width={110} height={24} sx={{ mb: 0.5 }} />
              <MuiSkeleton variant="rounded" width={70} height={12} />
            </div>
            <MuiSkeleton variant="rounded" width={110} height={36} sx={{ borderRadius: 2 }} />
          </Box>
        </Box>
      </Card>
    );
  }

  // Grid Layout Skeleton
  return (
    <Card
      className={className}
      sx={{
        borderRadius: '20px',
        bgcolor: '#FFFFFF',
        border: '1px solid rgba(24, 36, 27, 0.08)',
        boxShadow: '0 2px 10px rgba(24, 36, 27, 0.04)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      aria-hidden="true"
    >
      <Box sx={{ position: 'relative', height: 220, bgcolor: 'rgba(235, 230, 218, 0.5)' }}>
        <MuiSkeleton variant="rectangular" width="100%" height="100%" animation="wave" sx={{ bgcolor: 'rgba(235, 230, 218, 0.7)' }} />
        <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1 }}>
          <MuiSkeleton variant="rounded" width={70} height={22} sx={{ borderRadius: 1.5 }} />
          <MuiSkeleton variant="rounded" width={65} height={22} sx={{ borderRadius: 1.5 }} />
        </Box>
        <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
          <MuiSkeleton variant="circular" width={32} height={32} />
          <MuiSkeleton variant="circular" width={32} height={32} />
        </Box>
      </Box>

      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <MuiSkeleton variant="circular" width={14} height={14} />
              <MuiSkeleton variant="rounded" width={120} height={14} />
            </Box>
            <MuiSkeleton variant="rounded" width={50} height={16} />
          </Box>

          <MuiSkeleton variant="rounded" width="85%" height={22} sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#FAF8F2', borderRadius: 2, mb: 2, border: '1px solid #ECE7DA' }}>
            <Box>
              <MuiSkeleton variant="rounded" width={40} height={10} sx={{ mb: 0.5 }} />
              <MuiSkeleton variant="rounded" width={55} height={14} />
            </Box>
            <Box>
              <MuiSkeleton variant="rounded" width={40} height={10} sx={{ mb: 0.5 }} />
              <MuiSkeleton variant="rounded" width={55} height={14} />
            </Box>
            <Box>
              <MuiSkeleton variant="rounded" width={40} height={10} sx={{ mb: 0.5 }} />
              <MuiSkeleton variant="rounded" width={55} height={14} />
            </Box>
          </Box>
        </div>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5, borderTop: '1px solid #F0ECE1' }}>
          <div>
            <MuiSkeleton variant="rounded" width={90} height={20} sx={{ mb: 0.5 }} />
            <MuiSkeleton variant="rounded" width={60} height={12} />
          </div>
          <MuiSkeleton variant="rounded" width={95} height={32} sx={{ borderRadius: 2 }} />
        </Box>
      </Box>
    </Card>
  );
};

export interface PropertyGridSkeletonProps {
  count?: number;
  layout?: 'grid' | 'list';
  className?: string;
}

export const PropertyGridSkeleton: React.FC<PropertyGridSkeletonProps> = ({
  count = 6,
  layout = 'grid',
  className = ''
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      role="status"
      aria-label="Loading properties"
      aria-busy="true"
      className={
        layout === 'grid'
          ? `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ${className}`
          : `flex flex-col gap-5 ${className}`
      }
    >
      {items.map((key) => (
        <PropertyCardSkeleton key={key} layout={layout} />
      ))}
      <span className="sr-only">Loading properties...</span>
    </div>
  );
};

export const PropertyDetailsSkeleton: React.FC = () => {
  return (
    <Box role="status" aria-label="Loading property details" aria-busy="true" sx={{ minHeight: '100vh', bgcolor: '#F5F2E9', pb: 12 }}>
      {/* Top Breadcrumb & Actions Bar */}
      <Box sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #ECE7DA', py: 2 }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <MuiSkeleton variant="rounded" width={80} height={16} />
            <MuiSkeleton variant="rounded" width={12} height={12} />
            <MuiSkeleton variant="rounded" width={140} height={16} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <MuiSkeleton variant="rounded" width={90} height={34} sx={{ borderRadius: 2 }} />
            <MuiSkeleton variant="rounded" width={90} height={34} sx={{ borderRadius: 2 }} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, pt: 4 }}>
        {/* Header Card */}
        <Card sx={{ bgcolor: '#FFFFFF', p: { xs: 3, sm: 4 }, borderRadius: '24px', mb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', pb: 3, borderBottom: '1px solid #F0ECE1', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <MuiSkeleton variant="rounded" width={110} height={26} sx={{ borderRadius: 1.5 }} />
                <MuiSkeleton variant="rounded" width={90} height={26} sx={{ borderRadius: 1.5 }} />
              </Box>
              <MuiSkeleton variant="rounded" width="70%" height={32} sx={{ mb: 1.5 }} />
              <MuiSkeleton variant="rounded" width="40%" height={16} />
            </Box>
            <Box sx={{ textAlign: { md: 'right' } }}>
              <MuiSkeleton variant="rounded" width={140} height={36} sx={{ mb: 1, ml: { md: 'auto' } }} />
              <MuiSkeleton variant="rounded" width={90} height={14} sx={{ ml: { md: 'auto' } }} />
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, pt: 3 }}>
            <MuiSkeleton variant="rounded" height={360} sx={{ borderRadius: '16px' }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <MuiSkeleton variant="rounded" height={172} sx={{ borderRadius: '16px' }} />
              <MuiSkeleton variant="rounded" height={172} sx={{ borderRadius: '16px' }} />
            </Box>
          </Box>
        </Card>

        {/* Content & Sidebar */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Card sx={{ p: 3, borderRadius: '20px' }}>
              <MuiSkeleton variant="rounded" width={150} height={24} sx={{ mb: 3 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Box key={i} sx={{ p: 2, bgcolor: '#FAF8F2', borderRadius: 2, border: '1px solid #ECE7DA' }}>
                    <MuiSkeleton variant="rounded" width={60} height={12} sx={{ mb: 1 }} />
                    <MuiSkeleton variant="rounded" width={90} height={18} />
                  </Box>
                ))}
              </Box>
            </Card>

            <Card sx={{ p: 3, borderRadius: '20px' }}>
              <MuiSkeleton variant="rounded" width={160} height={24} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                <MuiSkeleton variant="rounded" width="100%" height={14} />
                <MuiSkeleton variant="rounded" width="100%" height={14} />
                <MuiSkeleton variant="rounded" width="80%" height={14} />
                <MuiSkeleton variant="rounded" width="60%" height={14} />
              </Box>
            </Card>
          </Box>

          <Card sx={{ p: 3, borderRadius: '20px', height: 'fit-content' }}>
            <MuiSkeleton variant="rounded" width={160} height={24} sx={{ mb: 2 }} />
            <MuiSkeleton variant="rounded" width="100%" height={16} sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <MuiSkeleton variant="rounded" height={44} sx={{ borderRadius: 2 }} />
              <MuiSkeleton variant="rounded" height={44} sx={{ borderRadius: 2 }} />
              <MuiSkeleton variant="rounded" height={44} sx={{ borderRadius: 2 }} />
              <MuiSkeleton variant="rounded" height={48} sx={{ borderRadius: 2, bgcolor: '#013E18', opacity: 0.2 }} />
            </Box>
          </Card>
        </Box>
      </Box>
      <span className="sr-only">Loading property details...</span>
    </Box>
  );
};

export const PageTransitionSkeleton: React.FC<{ title?: string }> = ({ title = 'Preparing Collection...' }) => {
  return (
    <Box
      role="status"
      aria-label={title}
      aria-busy="true"
      sx={{
        minHeight: '65vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Soft Golden Ambient Radial Aura */}
        <div
          className="animate-pulse"
          style={{
            position: 'absolute',
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201, 147, 37, 0.28) 0%, rgba(1, 62, 24, 0.08) 50%, transparent 72%)',
            pointerEvents: 'none',
          }}
        />

        {/* Monogram Icon Container with Continuous Luxury Animation */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: 'drop-shadow(0 6px 16px rgba(1, 62, 24, 0.18))',
            }}
          >
            <path d="M0 0H100V20.5H22.7V79.5H72.6V100H0V0Z" fill="#013E18" />
            <path d="M38.7 40H100V100H79V60.5H38.7V40Z" fill="#C99325" />
          </svg>
        </div>
      </div>
      <span className="sr-only">Loading Grounds and Gates...</span>
    </Box>
  );
};
