import React from 'react';
import { OwnershipType, ListingStatus } from '../../types/property';
import { Building2, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

interface BadgeProps {
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
  size = 'md'
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  if (type === 'demo') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded font-medium border border-amber-600/30 bg-amber-500/10 text-amber-900 tracking-wide uppercase text-[10px] ${sizeClasses} ${className}`}
        title="Simulated sample listing for demonstration purposes"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
        Demo Listing
      </span>
    );
  }

  if (type === 'company') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded font-bold bg-[#013E18] text-[#F5F2E9] shadow-xs tracking-tight ${sizeClasses} ${className}`}
        title="Official Grounds & Gates Company Owned Listing"
      >
        <Building2 className="w-3.5 h-3.5 text-[#C99325]" />
        <span>Grounds & Gates Direct</span>
      </span>
    );
  }

  if (type === 'third-party') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded font-medium bg-[#18241B]/10 text-[#18241B] border border-[#18241B]/20 ${sizeClasses} ${className}`}
        title="Third-Party Seller / Registered Channel Partner"
      >
        <UserCheck className="w-3.5 h-3.5 text-[#536458]" />
        <span>{label || 'Third-Party Seller'}</span>
      </span>
    );
  }

  if (type === 'featured') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded font-bold bg-[#C99325] text-white shadow-xs ${sizeClasses} ${className}`}
      >
        <Sparkles className="w-3 h-3 fill-current" />
        <span>Featured</span>
      </span>
    );
  }

  if (type === 'status' && status) {
    const statusMap: Record<ListingStatus, { bg: string; label: string }> = {
      active: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Active Listing' },
      'under-negotiation': { bg: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Under Negotiation' },
      sold: { bg: 'bg-rose-100 text-rose-800 border-rose-300', label: 'Sold Out' },
      'pending-review': { bg: 'bg-gray-100 text-gray-800 border-gray-300', label: 'Pending Review' }
    };
    const s = statusMap[status];
    return (
      <span className={`inline-flex items-center border rounded font-medium ${s.bg} ${sizeClasses} ${className}`}>
        {label || s.label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded bg-stone-200 text-stone-800 ${sizeClasses} ${className}`}>
      {label}
    </span>
  );
};
