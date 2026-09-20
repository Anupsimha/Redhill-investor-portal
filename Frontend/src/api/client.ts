import { getApiUrl } from '../config/env';

export interface ApiFetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

/**
 * Enhanced fetch wrapper for the application:
 * 1. Automatically prepends VITE_API_BASE_URL (if configured)
 * 2. Automatically includes credentials (cookies) for cross-domain / same-domain auth
 * 3. Handles query parameters cleanly
 */
export async function apiFetch(endpoint: string, options: ApiFetchOptions = {}): Promise<Response> {
  let url = getApiUrl(endpoint);

  // Append query params if provided
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const defaultHeaders: Record<string, string> = {};
  if (options.body && !(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  // Include Bearer token from localStorage for seamless cross-domain auth across Render subdomains
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('redhill_auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const finalOptions: RequestInit = {
    credentials: 'include', // Ensures session cookie is sent across Render domains
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  return fetch(url, finalOptions);
}

/**
 * Standardized JSON API Client helper with error parsing
 */
export const apiClient = {
  async get<T = any>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
    const res = await apiFetch(endpoint, { ...options, method: 'GET' });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errorData.error || `GET ${endpoint} failed with status ${res.status}`);
    }
    return res.json();
  },

  async post<T = any>(endpoint: string, body?: any, options: ApiFetchOptions = {}): Promise<T> {
    const res = await apiFetch(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errorData.error || `POST ${endpoint} failed with status ${res.status}`);
    }
    return res.json();
  },

  async patch<T = any>(endpoint: string, body?: any, options: ApiFetchOptions = {}): Promise<T> {
    const res = await apiFetch(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errorData.error || `PATCH ${endpoint} failed with status ${res.status}`);
    }
    return res.json();
  },

  async put<T = any>(endpoint: string, body?: any, options: ApiFetchOptions = {}): Promise<T> {
    const res = await apiFetch(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errorData.error || `PUT ${endpoint} failed with status ${res.status}`);
    }
    return res.json();
  },

  async delete<T = any>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
    const res = await apiFetch(endpoint, { ...options, method: 'DELETE' });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errorData.error || `DELETE ${endpoint} failed with status ${res.status}`);
    }
    return res.json();
  },

  async upload<T = any>(endpoint: string, formData: FormData, options: ApiFetchOptions = {}): Promise<T> {
    const res = await apiFetch(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errorData.error || `Upload to ${endpoint} failed with status ${res.status}`);
    }
    return res.json();
  },
};
