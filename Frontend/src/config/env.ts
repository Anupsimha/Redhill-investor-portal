/**
 * Frontend Environment & Global Configuration
 * 
 * In Vite, environment variables exposed to the client must start with `VITE_`.
 */

// Production Render backend fallback URL
const DEFAULT_PROD_API_URL = 'https://redhill-investor-portal.onrender.com';

// Auto-detect production Render deployment if env var wasn't set at build time
function resolveApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  // If running in browser on Render production domain, default to deployed Render backend
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return DEFAULT_PROD_API_URL;
  }

  // In local development, default to empty string so Vite dev proxy handles /api
  return '';
}

export const API_BASE_URL = resolveApiBaseUrl();

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
 * Curated Bengaluru Boutique High-Rise Apartment (12+ Floors) architectural photography collection.
 * Used as fallbacks and to replace generic stock / low-rise / single-family house placeholders.
 */
export const BOUTIQUE_APARTMENT_IMAGES = [
  // 0: 15-Storey Contemporary Boutique Residential Tower (5-Acre Community, Whitefield)
  '/assets/projects/signature-towers.jpg',
  // 1: 12-Storey Twin Boutique Courtyard High-Rise (4-Acre Community, Sarjapur Road)
  '/assets/projects/emerald-gardens.jpg',
  // 2: 16-Storey Contemporary Boutique High-Rise (2-Acre Enclave, Hebbal)
  '/assets/projects/pinnacle-heights.jpg',
  // 3: 12-Storey Full-Floor Sky Residence Tower (2-Acre Enclave, Indiranagar)
  '/assets/projects/sovereign-estates.jpg',
  // 4: 14-Storey Flagship Boutique Residential Community (Bengaluru)
  '/assets/projects/hero-highrise.jpg',
];

// Legacy single-family house, generic stock, or low-rise brick URLs stored in seed DB records that should map to 12+ floor boutique high-rise apartments
const LEGACY_HOUSE_PATTERNS = [
  'picsum.photos',
  'photo-1600585154340-be6161a56a0c',
  'photo-1600596542815-ffad4c1539a9',
  'photo-1613490493576-7fde63acd811',
  'photo-1582719478250-c89cae4dc85b',
  'photo-1580041065738-e72023775cdc',
  'photo-1574362848149-11496d93a7c7',
  'photo-1512915922686-57c11dde9b6b',
  'photo-1545324418-cc1a3fa10c00',
];

function pickBoutiqueImage(seed?: number | string | null): string {
  if (seed === undefined || seed === null) return BOUTIQUE_APARTMENT_IMAGES[0];
  if (typeof seed === 'number') {
    const idx = Math.max(0, seed - 1);
    return BOUTIQUE_APARTMENT_IMAGES[idx % BOUTIQUE_APARTMENT_IMAGES.length];
  }
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return BOUTIQUE_APARTMENT_IMAGES[Math.abs(hash) % BOUTIQUE_APARTMENT_IMAGES.length];
}

/**
 * Resolves a full asset/image URL for user uploads or media.
 * Automatically replaces generic picsum or legacy western house placeholders
 * with curated Bengaluru boutique apartment photography.
 */
export function getAssetUrl(path?: string | null, seed?: number | string | null): string {
  if (!path) return pickBoutiqueImage(seed);

  if (LEGACY_HOUSE_PATTERNS.some((pattern) => path.includes(pattern))) {
    return pickBoutiqueImage(seed ?? path);
  }

  if (/^(https?:|\/\/|data:)/i.test(path)) return path;
  if (path.startsWith('/assets/')) return path;

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
