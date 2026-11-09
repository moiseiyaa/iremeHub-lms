/**
 * Canonical frontend API client.
 * All browser requests use the same-origin /api/v1 proxy configured by Next.js.
 * This avoids accidental double /api/v1 prefixes and cross-origin token leakage.
 * Temporary bearer tokens remain for legacy compatibility until server sessions ship.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error?: string;
  status?: number;
  message?: string;
  count?: number;
  total?: number;
  totalPages?: number;
  pages?: number;
  isValid?: boolean;
}

const API_BASE_URL = '/api/v1';
const UNAUTHORIZED_EVENT = 'iremehub:auth-changed';

type Payload<T> = {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  total?: number;
  totalPages?: number;
  pages?: number;
  isValid?: boolean;
};

const toError = (value: unknown, fallback: string): string => {
  if (typeof value === 'string' && value.trim()) return value;
  return fallback;
};

const parseResponse = (text: string): unknown => {
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error('The API returned an invalid response. Please try again.');
  }
};

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth = false
): Promise<ApiResponse<T>> {
  if (!endpoint.startsWith('/') || endpoint.startsWith('//')) {
    return {success: false, data: null, error: 'Invalid API endpoint.'};
  }

  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (requiresAuth) {
    if (typeof window === 'undefined') {
      return {success: false, data: null, error: 'Authentication is required.'};
    }
    const token = window.localStorage.getItem('token');
    if (!token) return {success: false, data: null, error: 'Please sign in to continue.', status: 401};
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      cache: 'no-store',
      credentials: 'same-origin',
      ...options,
      headers
    });
    const decoded = parseResponse(await response.text());
    const envelope = decoded && typeof decoded === 'object' ? decoded as Payload<T> : {};
    if (response.status === 401 && requiresAuth && typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    if (!response.ok || envelope.success === false) {
      return {
        success: false,
        data: null,
        status: response.status,
        error: toError(envelope.error || envelope.message, response.status === 403 ? 'You do not have permission to perform this action.' : 'The request could not be completed.')
      };
    }
    return {
      success: true,
      data: 'data' in envelope ? (envelope.data ?? null) : decoded as T,
      status: response.status,
      message: envelope.message,
      count: envelope.count,
      total: envelope.total,
      totalPages: envelope.totalPages,
      pages: envelope.pages,
      isValid: envelope.isValid
    };
  } catch (err) {
    return {success: false, data: null, error: err instanceof Error ? err.message : 'Network request failed.'};
  }
}

export const apiGet = <T = unknown>(endpoint: string, requiresAuth = false) =>
  apiRequest<T>(endpoint, {method: 'GET'}, requiresAuth);

export const apiPost = <T = unknown>(endpoint: string, body: Record<string, unknown> | FormData, requiresAuth = false) =>
  apiRequest<T>(endpoint, {method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body)}, requiresAuth);

export const apiPut = <T = unknown>(endpoint: string, body: Record<string, unknown> | FormData, requiresAuth = false) =>
  apiRequest<T>(endpoint, {method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body)}, requiresAuth);

export const apiPatch = <T = unknown>(endpoint: string, body: Record<string, unknown> | FormData, requiresAuth = false) =>
  apiRequest<T>(endpoint, {method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body)}, requiresAuth);

export const apiDelete = <T = unknown>(endpoint: string, requiresAuth = false) =>
  apiRequest<T>(endpoint, {method: 'DELETE'}, requiresAuth);
