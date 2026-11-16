/**
 * Centralized utility to resolve and sanitize property and user image URLs.
 * Automatically translates relative backend upload paths (e.g., /uploads/images/file.png)
 * into absolute URLs pointing to the backend API origin, while gracefully falling back
 * to high-resolution default images when missing or invalid.
 */

export const DEFAULT_PROPERTY_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';
export const BACKEND_URL = API_BASE.replace(/\/api\/v1\/?$/, '');

/**
 * Resolves an image URL to an absolute URL.
 * Handles:
 * - Full URLs (http://, https://, data:, blob:) -> returned unchanged
 * - Relative upload paths (/uploads/images/..., uploads/...) -> prepends backend origin
 * - Null / empty / undefined -> returns fallback image
 */
export function resolveImageUrl(
  url?: string | null,
  fallback: string = DEFAULT_PROPERTY_FALLBACK_IMAGE
): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }

  const clean = url.trim();

  // If already absolute or protocol-relative
  if (
    clean.startsWith('http://') ||
    clean.startsWith('https://') ||
    clean.startsWith('data:') ||
    clean.startsWith('blob:')
  ) {
    return clean;
  }

  // If relative path from uploads
  if (clean.startsWith('/uploads/')) {
    return `${BACKEND_URL}${clean}`;
  }

  if (clean.startsWith('uploads/')) {
    return `${BACKEND_URL}/${clean}`;
  }

  // Any other relative path
  if (clean.startsWith('/')) {
    return `${BACKEND_URL}${clean}`;
  }

  return `${BACKEND_URL}/${clean}`;
}

/**
 * Normalizes an array of property images, ensuring at least one valid resolved URL is present.
 */
export function resolvePropertyImages(
  images?: string[] | null,
  fallback: string = DEFAULT_PROPERTY_FALLBACK_IMAGE
): string[] {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [fallback];
  }

  const resolved = images
    .filter((img) => typeof img === 'string' && img.trim().length > 0)
    .map((img) => resolveImageUrl(img, fallback));

  return resolved.length > 0 ? resolved : [fallback];
}

/**
 * Standard synthetic image error handler for <img> elements.
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback: string = DEFAULT_PROPERTY_FALLBACK_IMAGE
): void {
  const target = e.currentTarget;
  if (target && target.src !== fallback) {
    target.src = fallback;
  }
}

