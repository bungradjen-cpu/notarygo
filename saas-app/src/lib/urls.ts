/**
 * Canonical URL utilities for NotaryGo Multi-subdomain SaaS
 */

export function getAppUrl(path: string = ''): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${cleanBase}${cleanPath}`;
}

export function getMarketingUrl(path: string = ''): string {
  const baseUrl = process.env.NEXT_PUBLIC_MARKETING_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${cleanBase}${cleanPath}`;
}

export function getAuthCallbackUrl(): string {
  return getAppUrl('/auth/callback');
}

export function getResetPasswordUrl(): string {
  return getAppUrl('/auth/reset-password');
}

export function getMayarWebhookUrl(): string {
  return getAppUrl('/api/webhooks/mayar');
}
