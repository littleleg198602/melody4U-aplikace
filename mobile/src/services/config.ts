export const API_BASE =
  (process.env.EXPO_PUBLIC_API_BASE || '').trim() ||
  'https://melody4u-api.onrender.com';

export function toAbsoluteApiUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return '';
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (pathOrUrl.startsWith('/')) return `${API_BASE}${pathOrUrl}`;
  return `${API_BASE}/${pathOrUrl}`;
}
