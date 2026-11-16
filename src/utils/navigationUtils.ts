/**
 * Safely validates and sanitizes internal application redirect paths.
 * Prevents open-redirect vulnerabilities, javascript: injection, and redirect loops.
 */
export const getSafeRedirectPath = (path?: string | null, fallback = '/'): string => {
  if (!path) return fallback;
  const trimmed = path.trim();

  // Must begin with single forward slash, must not be protocol-relative (//)
  // and must not contain any colon (e.g. javascript:, https:)
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes(':')) {
    return fallback;
  }

  // Prevent redirect loops to authentication endpoints
  const clean = trimmed.split('?')[0].toLowerCase();
  if (
    clean === '/login' ||
    clean === '/register' ||
    clean === '/forgot-password' ||
    clean === '/verify-email'
  ) {
    return fallback;
  }

  return trimmed;
};

