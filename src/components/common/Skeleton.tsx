import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'rounded' | 'circular' | 'text';
  animation?: 'shimmer' | 'pulse' | 'none';
  className?: string;
}

/**
 * Base Skeleton component with Grounds & Gates warm ivory shimmer styling.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  animation = 'shimmer',
  className = '',
  ...props
}) => {
  const variantClass = {
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-sm h-4'
  }[variant];

  const animationClass = {
    shimmer: 'animate-shimmer',
    pulse: 'animate-pulse bg-stone-200/80',
    none: 'bg-stone-200/60'
  }[animation];

  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden ${variantClass} ${animationClass} ${className}`}
      {...props}
    />
  );
};

export interface PropertyCardSkeletonProps {
  layout?: 'grid' | 'list';
  className?: string;
}

/**
 * Property Card Skeleton matching the exact layout and dimensions of PropertyCard.tsx.
 */
export const PropertyCardSkeleton: React.FC<PropertyCardSkeletonProps> = ({
  layout = 'grid',
  className = ''
}) => {
  if (layout === 'list') {
    return (
      <div
        className={`bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden flex flex-col md:flex-row ${className}`}
        aria-hidden="true"
      >
        {/* Left Thumbnail Placeholder */}
        <div className="relative md:w-80 h-56 md:h-auto shrink-0 bg-stone-200/60 animate-shimmer overflow-hidden">
          {/* Top Badges Placeholder */}
          <div className="absolute top-3 left-3 flex gap-1.5 z-10">
            <div className="w-20 h-5 rounded-full bg-stone-300/70" />
            <div className="w-16 h-5 rounded-full bg-stone-300/70" />
          </div>
          {/* Top Right Actions */}
          <div className="absolute top-3 right-3 flex gap-1.5 z-10">
            <div className="w-8 h-8 rounded-full bg-stone-300/70" />
            <div className="w-8 h-8 rounded-full bg-stone-300/70" />
          </div>
          {/* Bottom Ownership Badge */}
          <div className="absolute bottom-3 left-3 z-10">
            <div className="w-28 h-5 rounded-full bg-stone-300/70" />
          </div>
        </div>

        {/* Content Placeholder */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-24 h-3.5 rounded bg-stone-200/80 animate-shimmer" />
              <div className="w-20 h-3 rounded bg-stone-200/60 animate-shimmer" />
            </div>

            {/* Title */}
            <div className="w-3/4 h-5 rounded-md bg-stone-200/90 animate-shimmer mb-2" />

            {/* Location */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3.5 h-3.5 rounded-full bg-stone-300/70" />
              <div className="w-48 h-3.5 rounded bg-stone-200/70 animate-shimmer" />
            </div>

            {/* Description lines */}
            <div className="space-y-1.5 my-3">
              <div className="w-full h-3 rounded bg-stone-100 animate-shimmer" />
              <div className="w-5/6 h-3 rounded bg-stone-100 animate-shimmer" />
            </div>

            {/* Specs Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 border-y border-stone-100">
              <div className="h-4 rounded bg-stone-200/60 animate-shimmer" />
              <div className="h-4 rounded bg-stone-200/60 animate-shimmer" />
              <div className="h-4 rounded bg-stone-200/60 animate-shimmer" />
              <div className="h-4 rounded bg-stone-200/60 animate-shimmer" />
            </div>
          </div>

          {/* Bottom Price & Button */}
          <div className="flex items-center justify-between pt-4 mt-2">
            <div>
              <div className="w-28 h-6 rounded-md bg-stone-200/90 animate-shimmer mb-1" />
              <div className="w-20 h-3 rounded bg-stone-200/60 animate-shimmer" />
            </div>
            <div className="w-28 h-9 rounded-xl bg-stone-200/90 animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  // Grid Layout Skeleton
  return (
    <div
      className={`bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden flex flex-col justify-between ${className}`}
      aria-hidden="true"
    >
      {/* Image Area Skeleton */}
      <div className="relative h-56 bg-stone-200/70 animate-shimmer overflow-hidden">
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 z-10">
          <div className="w-16 h-5 rounded-full bg-stone-300/80" />
          <div className="w-16 h-5 rounded-full bg-stone-300/80" />
        </div>
        {/* Action icons */}
        <div className="absolute top-3 right-3 flex gap-1.5 z-10">
          <div className="w-8 h-8 rounded-full bg-stone-300/80" />
          <div className="w-8 h-8 rounded-full bg-stone-300/80" />
        </div>
        {/* Bottom bar overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-10">
          <div className="w-24 h-5 rounded-full bg-stone-300/80" />
          <div className="w-12 h-4 rounded bg-stone-300/80" />
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Tag line */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-stone-200" />
              <div className="w-32 h-3.5 rounded bg-stone-200/80 animate-shimmer" />
            </div>
            <div className="w-14 h-4 rounded bg-stone-200/60 animate-shimmer" />
          </div>

          {/* Title Line */}
          <div className="w-4/5 h-5 rounded-md bg-stone-200/90 animate-shimmer mb-3" />

          {/* 3-Column Key Specs Box */}
          <div className="flex items-center justify-between py-2.5 px-3 bg-[#F5F2E9]/60 rounded-xl mb-3 border border-stone-200/50">
            <div className="flex flex-col gap-1 w-1/4">
              <div className="w-10 h-2.5 rounded bg-stone-200/60 animate-shimmer" />
              <div className="w-14 h-3.5 rounded bg-stone-200/90 animate-shimmer" />
            </div>
            <div className="flex flex-col gap-1 w-1/4">
              <div className="w-10 h-2.5 rounded bg-stone-200/60 animate-shimmer" />
              <div className="w-14 h-3.5 rounded bg-stone-200/90 animate-shimmer" />
            </div>
            <div className="flex flex-col gap-1 w-1/4">
              <div className="w-10 h-2.5 rounded bg-stone-200/60 animate-shimmer" />
              <div className="w-14 h-3.5 rounded bg-stone-200/90 animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Price & CTA Button */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="w-24 h-5 rounded bg-stone-200/90 animate-shimmer mb-1" />
            <div className="w-16 h-2.5 rounded bg-stone-200/60 animate-shimmer" />
          </div>
          <div className="w-24 h-8 rounded-lg bg-stone-200/90 animate-shimmer" />
        </div>
      </div>
    </div>
  );
};

export interface PropertyGridSkeletonProps {
  count?: number;
  layout?: 'grid' | 'list';
  className?: string;
}

/**
 * Property Grid Skeleton component rendering a responsive collection of PropertyCardSkeletons.
 */
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

/**
 * Property Details Skeleton for the full-page property view.
 */
export const PropertyDetailsSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading property details"
      aria-busy="true"
      className="min-h-screen bg-[#F5F2E9] pb-24"
    >
      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white border-b border-stone-200/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-20 h-4 rounded bg-stone-200/80 animate-shimmer" />
            <div className="w-3 h-3 rounded bg-stone-200/60" />
            <div className="w-32 h-4 rounded bg-stone-200/80 animate-shimmer" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 h-8 rounded-lg bg-stone-200/80 animate-shimmer" />
            <div className="w-24 h-8 rounded-lg bg-stone-200/80 animate-shimmer" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Title & Price Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-28 h-6 rounded-full bg-stone-200/80 animate-shimmer" />
                <div className="w-24 h-6 rounded-full bg-stone-200/80 animate-shimmer" />
              </div>
              <div className="w-96 max-w-full h-8 rounded-lg bg-stone-200/90 animate-shimmer" />
              <div className="w-64 h-4 rounded bg-stone-200/70 animate-shimmer" />
            </div>
            <div className="space-y-2 md:text-right">
              <div className="w-36 h-9 rounded-lg bg-stone-200/90 animate-shimmer md:ml-auto" />
              <div className="w-24 h-3.5 rounded bg-stone-200/60 animate-shimmer md:ml-auto" />
            </div>
          </div>

          {/* Photo Gallery Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            <div className="md:col-span-2 h-72 sm:h-96 rounded-2xl bg-stone-200/80 animate-shimmer" />
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4 h-72 sm:h-96">
              <div className="rounded-2xl bg-stone-200/80 animate-shimmer" />
              <div className="rounded-2xl bg-stone-200/80 animate-shimmer" />
            </div>
          </div>
        </div>

        {/* 2-Column Content + Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Specs Grid */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
              <div className="w-36 h-6 rounded bg-stone-200/90 animate-shimmer mb-6" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 flex flex-col gap-1.5">
                    <div className="w-16 h-3 rounded bg-stone-200/60 animate-shimmer" />
                    <div className="w-24 h-4 rounded bg-stone-200/90 animate-shimmer" />
                  </div>
                ))}
              </div>
            </div>

            {/* Description Text */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-3">
              <div className="w-40 h-6 rounded bg-stone-200/90 animate-shimmer mb-4" />
              <div className="w-full h-3.5 rounded bg-stone-200/60 animate-shimmer" />
              <div className="w-full h-3.5 rounded bg-stone-200/60 animate-shimmer" />
              <div className="w-4/5 h-3.5 rounded bg-stone-200/60 animate-shimmer" />
              <div className="w-3/5 h-3.5 rounded bg-stone-200/60 animate-shimmer" />
            </div>
          </div>

          {/* Sticky Enquiry Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
              <div className="w-44 h-6 rounded bg-stone-200/90 animate-shimmer" />
              <div className="w-full h-4 rounded bg-stone-200/60 animate-shimmer" />
              <div className="space-y-3 pt-3">
                <div className="w-full h-10 rounded-xl bg-stone-100 animate-shimmer" />
                <div className="w-full h-10 rounded-xl bg-stone-100 animate-shimmer" />
                <div className="w-full h-10 rounded-xl bg-stone-100 animate-shimmer" />
                <div className="w-full h-12 rounded-xl bg-stone-200/90 animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">Loading property details...</span>
    </div>
  );
};

/**
 * Full Page Transition Skeleton for navigation between main views.
 */
export const PageTransitionSkeleton: React.FC<{ title?: string }> = ({ title = 'Loading...' }) => {
  return (
    <div
      role="status"
      aria-label={title}
      aria-busy="true"
      className="min-h-[70vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      {/* Top Banner Skeleton */}
      <div className="mb-8 space-y-2">
        <div className="w-32 h-4 rounded bg-stone-200/70 animate-shimmer" />
        <div className="w-72 h-8 rounded-lg bg-stone-200/90 animate-shimmer" />
        <div className="w-96 max-w-full h-4 rounded bg-stone-200/60 animate-shimmer" />
      </div>

      {/* Filter Bar Placeholder */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs mb-8 flex flex-wrap gap-3 items-center justify-between">
        <div className="w-64 h-9 rounded-xl bg-stone-100 animate-shimmer" />
        <div className="flex gap-2">
          <div className="w-28 h-9 rounded-xl bg-stone-100 animate-shimmer" />
          <div className="w-28 h-9 rounded-xl bg-stone-100 animate-shimmer" />
          <div className="w-10 h-9 rounded-xl bg-stone-100 animate-shimmer" />
        </div>
      </div>

      {/* Grid of 6 Property Skeletons */}
      <PropertyGridSkeleton count={6} layout="grid" />
    </div>
  );
};
