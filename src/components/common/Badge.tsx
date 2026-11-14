import React from 'react';
import { ListingStatus } from '../../types/property';
import Chip from '@mui/material/Chip';
import BusinessIcon from '@mui/icons-material/Business';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export interface BadgeProps {
  type: 'demo' | 'company' | 'third-party' | 'featured' | 'status' | 'category';
  status?: ListingStatus;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  type,
  status,
  label,
  className = '',
  size = 'md',
}) => {
  const muiSize = size === 'sm' ? 'small' : 'medium';

  if (type === 'demo') {
    return (
      <Chip
        size={muiSize}
        label="Demo Listing"
        className={className}
        icon={
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse ml-1 inline-block" />
        }
        sx={{
          fontWeight: 700,
          fontSize: size === 'sm' ? '0.65rem' : '0.72rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          bgcolor: 'rgba(245, 158, 11, 0.12)',
          color: '#78350F',
          border: '1px solid rgba(217, 119, 6, 0.35)',
          height: size === 'sm' ? 22 : 26,
          '& .MuiChip-label': { px: 1 },
        }}
        title="Simulated sample listing for demonstration purposes"
      />
    );
  }

  if (type === 'company') {
    return (
      <Chip
        size={muiSize}
        icon={<BusinessIcon sx={{ fontSize: 14, color: '#C99325' }} />}
        label="Grounds & Gates Direct"
        className={className}
        sx={{
          fontWeight: 800,
          fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
          bgcolor: '#013E18',
          color: '#F5F2E9',
          boxShadow: '0 2px 6px rgba(1, 62, 24, 0.25)',
          height: size === 'sm' ? 24 : 28,
          '& .MuiChip-label': { px: 1 },
          '& .MuiChip-icon': { ml: 0.8 },
        }}
        title="Official Grounds & Gates Company Owned Listing"
      />
    );
  }

  if (type === 'third-party') {
    return (
      <Chip
        size={muiSize}
        icon={<HowToRegIcon sx={{ fontSize: 14, color: '#536458' }} />}
        label={label || 'Third-Party Seller'}
        className={className}
        sx={{
          fontWeight: 600,
          fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
          bgcolor: 'rgba(24, 36, 27, 0.08)',
          color: '#18241B',
          border: '1px solid rgba(24, 36, 27, 0.18)',
          height: size === 'sm' ? 24 : 28,
          '& .MuiChip-label': { px: 1 },
          '& .MuiChip-icon': { ml: 0.8 },
        }}
        title="Third-Party Seller / Registered Channel Partner"
      />
    );
  }

  if (type === 'featured') {
    return (
      <Chip
        size={muiSize}
        icon={<AutoAwesomeIcon sx={{ fontSize: 13, color: '#FFFFFF' }} />}
        label="Featured"
        className={className}
        sx={{
          fontWeight: 800,
          fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
          bgcolor: '#C99325',
          color: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(201, 147, 37, 0.35)',
          height: size === 'sm' ? 24 : 28,
          '& .MuiChip-label': { px: 1 },
          '& .MuiChip-icon': { ml: 0.8 },
        }}
      />
    );
  }

  if (type === 'status' && status) {
    const statusMap: Record<ListingStatus, { bg: string; color: string; border: string; label: string }> = {
      active: { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0', label: 'Active Listing' },
      'under-negotiation': { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', label: 'Under Negotiation' },
      sold: { bg: '#FFE4E6', color: '#9F1239', border: '#FECDD3', label: 'Sold Out' },
      'pending-review': { bg: '#F3F4F6', color: '#374151', border: '#E5E7EB', label: 'Pending Review' }
    };
    const s = statusMap[status];
    return (
      <Chip
        size={muiSize}
        label={label || s.label}
        className={className}
        sx={{
          fontWeight: 700,
          fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
          bgcolor: s.bg,
          color: s.color,
          border: `1px solid ${s.border}`,
          height: size === 'sm' ? 22 : 26,
          '& .MuiChip-label': { px: 1 },
        }}
      />
    );
  }

  return (
    <Chip
      size={muiSize}
      label={label}
      className={className}
      sx={{
        fontWeight: 600,
        fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
        bgcolor: '#E7E5E4',
        color: '#292524',
        height: size === 'sm' ? 22 : 26,
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
};
