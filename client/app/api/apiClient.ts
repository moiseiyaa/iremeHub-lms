// import { redirect } from 'next/navigation';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error?: string;
}

export type JsonResponse<T> = T | { success?: boolean; data?: T; error?: string };

// If deploying the front-end separately (e.g. Vercel) provide the absolute URL of
// the backend in NEXT_PUBLIC_API_BASE_URL – e.g. "https://lms-backend.vercel.app/api/v1"
// Otherwise fall back to relative path for local dev / same-origin deployments.
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1').replace(/\/$/, '');

const handleAuthError = (endpoint: string) => {
  // Only clear token and redirect for specific protected endpoints
  // Preserve token for course viewing which should be accessible to any authenticated user
  
  // For dashboard, profile, or account-specific endpoints - clear token and redirect
  const protectedEndpoints = [
    '/dashboard',
    '/profile',
    '/settings',
    '/account',
    '/auth/me',
  ];
  
  // Check if the current endpoint is a strictly protected one
  const isStrictlyProtected = protectedEndpoints.some(path => endpoint.includes(path));
  
  // If it's a course endpoint, don't clear the token (students should be able to view courses)
  const isCourseEndpoint = endpoint.includes('/courses/');
  
  if (isStrictlyProtected || !isCourseEndpoint) {
    // Clear the expired token
    localStorage.removeItem('token');
    
    // Get the current path to redirect back after login
    const currentPath = window.location.pathname;
    const redirectPath = encodeURIComponent(currentPath);
    
    // Redirect to login with return URL
    window.location.href = `/login?redirect=${redirectPath}`;
  }
};

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth = false
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    // Add auth header if required
    if (requiresAuth) {
      const token = localStorage.getItem('token');
      if (!token) {
        handleAuthError(endpoint);
        throw new Error('Authentication required');
      }
      
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }

    const response = await fetch(url, {
      cache: 'no-store',
      ...options,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Attempt to parse JSON – but if the server returned HTML (often an error page)
    // we throw a descriptive error so the UI can surface it.
    const text = await response.text();
    let data: JsonResponse<T>;
    try {
      data = JSON.parse(text) as JsonResponse<T>;
    } catch { // text was not valid JSON
      throw new Error('Server returned HTML instead of JSON. The API server might be unavailable or misconfigured.');
    }

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        handleAuthError(endpoint);
      }
      
      const envelopeError = (typeof data === 'object' && data && 'error' in data) ? (data as { error?: string }).error : undefined;
      throw new Error(envelopeError || 'API request failed');
    }

    return {
      success: true,
      data: (typeof data === 'object' && data && 'data' in data) ? (data as { data: T }).data : (data as T),
    };
  } catch (error) {
    // If it's an auth error, we've already handled it
    if (error instanceof Error && error.message !== 'Authentication required') {
      console.error('API Error:', error);
    }
    
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const apiGet = <T>(endpoint: string, requiresAuth = false) => 
  apiRequest<T>(endpoint, { method: 'GET' }, requiresAuth);

export const apiPost = <T>(endpoint: string, body: Record<string, unknown>, requiresAuth = false) =>
  apiRequest<T>(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify(body)
    },
    requiresAuth
  );

export const apiPatch = <T>(endpoint: string, body: Record<string, unknown>, requiresAuth = false) =>
  apiRequest<T>(
    endpoint,
    {
      method: 'PATCH',
      body: JSON.stringify(body)
    },
    requiresAuth
  );

export const apiPut = <T>(endpoint: string, body: Record<string, unknown>, requiresAuth = false) =>
  apiRequest<T>(
    endpoint,
    {
      method: 'PUT',
      body: JSON.stringify(body)
    },
    requiresAuth
  );

export const apiDelete = <T>(endpoint: string, requiresAuth = false) =>
  apiRequest<T>(endpoint, { method: 'DELETE' }, requiresAuth); 