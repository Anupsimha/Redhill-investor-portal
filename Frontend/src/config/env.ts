/**
 * Frontend Environment & Global Configuration
 * 
 * In Vite, environment variables exposed to the client must start with `VITE_`.
 */

// Strip trailing slash if present
const rawApiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_URL || '';
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

const rawAssetsUrl = import.meta.env.VITE_ASSETS_BASE_URL || API_BASE_URL;
export const ASSETS_BASE_URL = rawAssetsUrl.replace(/\/+$/, '');

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Redhill Investor Portal';
export const APP_ENV = import.meta.env.MODE || 'development';
export const IS_PROD = import.meta.env.PROD;

/**
 * Resolves a full API endpoint URL using the configured API_BASE_URL.
 * If API_BASE_URL is not configured, it returns a relative URL (which works with Vite proxy or same-origin).
 */
export function getApiUrl(endpoint: string): string {
  if (!endpoint) return '';
  if (/^https?:\/\//i.test(endpoint)) return endpoint;

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalizedEndpoint}` : normalizedEndpoint;
}

/**
 * Resolves a full asset/image URL for user uploads or media.
 * If path is an absolute URL or data URI, it is returned as is.
 * Otherwise, it prepends the backend ASSETS_BASE_URL.
 */
export function getAssetUrl(path?: string | null): string {
  if (!path) return '';
  if (/^(https?:|\/\/|data:)/i.test(path)) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return ASSETS_BASE_URL ? `${ASSETS_BASE_URL}${normalizedPath}` : normalizedPath;
}

export const envConfig = {
  API_BASE_URL,
  ASSETS_BASE_URL,
  APP_NAME,
  APP_ENV,
  IS_PROD,
  getApiUrl,
  getAssetUrl,
};

export default envConfig;
