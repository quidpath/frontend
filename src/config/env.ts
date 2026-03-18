/**
 * Resolve API base URLs from environment variables.
 *
 * Each service reads NEXT_PUBLIC_<SERVICE>_URL which is set per environment:
 *   - .env.local        → localhost ports (dev)
 *   - .env.stage        → stage subdomain URLs
 *   - .env              → production URLs (baked into Docker image at build time)
 *
 * All NEXT_PUBLIC_* vars are inlined at build time by Next.js — they must be
 * present when `next build` runs (i.e. in the CI/CD environment).
 */

export function getGatewayUrl(): string {
  return process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';
}

export function getBillingUrl(): string {
  return process.env.NEXT_PUBLIC_BILLING_URL || 'http://localhost:8002';
}

export function getInventoryUrl(): string {
  return process.env.NEXT_PUBLIC_INVENTORY_URL || 'http://localhost:8004';
}

export function getCrmUrl(): string {
  return process.env.NEXT_PUBLIC_CRM_URL || 'http://localhost:8005';
}

export function getHrmUrl(): string {
  return process.env.NEXT_PUBLIC_HRM_URL || 'http://localhost:8006';
}

export function getPosUrl(): string {
  return process.env.NEXT_PUBLIC_POS_URL || 'http://localhost:8003';
}

export function getProjectsUrl(): string {
  return process.env.NEXT_PUBLIC_PROJECTS_URL || 'http://localhost:8007';
}

export const GATEWAY_URL = getGatewayUrl();
