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
 * Curated Bengaluru Boutique Apartment architectural photography collection.
 * Used as fallbacks and to replace generic stock / single-family house placeholders.
 */
export const BOUTIQUE_APARTMENT_IMAGES = [
  // 0: Contemporary G+4 white & charcoal boutique apartment block with cantilevered glass balconies
  'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&q=85&w=1600',
  // 1: Tropical G+3 boutique courtyard apartment complex with pergolas & lush greenery
  'https://images.unsplash.com/photo-1580041065738-e72023775cdc?auto=format&fit=crop&q=85&w=1600',
  // 2: Warm terracotta-brick G+3 boutique apartment building with deep sit-out balconies
  'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&q=85&w=1600',
  // 3: Modern brick & dark-cladding boutique apartment facade with warm balcony lighting
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=85&w=1600',
  // 4: Contemporary low-rise boutique apartment elevation with rooftop pergola frame
  'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&q=85&w=1600',
  // 5: Warm twilight architectural foyer & timber screen residence
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=85&w=1600',
];

// Legacy single-family house / generic stock URLs stored in seed DB records that should map to boutique apartments
const LEGACY_HOUSE_PATTERNS = [
  'picsum.photos',
  'photo-1600585154340-be6161a56a0c',
  'photo-1600596542815-ffad4c1539a9',
  'photo-1613490493576-7fde63acd811',
  'photo-1582719478250-c89cae4dc85b',
];

function pickBoutiqueImage(seed?: number | string | null): string {
  if (seed === undefined || seed === null) return BOUTIQUE_APARTMENT_IMAGES[0];
  if (typeof seed === 'number') {
    return BOUTIQUE_APARTMENT_IMAGES[Math.abs(seed) % BOUTIQUE_APARTMENT_IMAGES.length];
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
