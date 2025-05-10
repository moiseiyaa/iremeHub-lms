// import { redirect } from 'next/navigation';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error?: string;
}

const API_BASE_URL = '/api/v1';

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

    // Special handling for auth/me endpoint in development mode
    if (process.env.NODE_ENV === 'development' && endpoint === '/auth/me') {
      // Check if we have a test user token (by checking for our known test user ID)
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            if (payload.id === '60d0fe4f5311236168a109ca') {
              console.log('Development mode: Providing mock user data for /auth/me');
              
              // Return mock user data for our test admin
              return {
                success: true,
                data: {
                  _id: '60d0fe4f5311236168a109ca',
                  id: '60d0fe4f5311236168a109ca',
                  name: 'Test Admin User',
                  email: 'test@example.com',
                  role: 'admin',
                  avatar: {
                    url: 'https://via.placeholder.com/150'
                  },
                  bio: 'Development test admin user',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                } as T,
              };
            }
          }
        } catch (parseError) {
          console.log('Token parse error:', parseError);
          // Continue with regular API request
        }
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Check content type to ensure we're dealing with JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Handle non-JSON responses
      const textResponse = await response.text();
      console.error('Non-JSON response received:', textResponse.substring(0, 100) + '...');
      
      // If authentication error, handle accordingly
      if (response.status === 401 && requiresAuth) {
        handleAuthError(endpoint);
      }
      
      throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 50)}...`);
    }

    // Now safely parse JSON
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      throw new Error('Failed to parse JSON response from server');
    }

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        handleAuthError(endpoint);
      }
      
      // Special development mode handling
      if (process.env.NODE_ENV === 'development' && endpoint === '/auth/me') {
        console.log('Development mode: Providing fallback for failed /auth/me request');
        
        return {
          success: true,
          data: {
            _id: '60d0fe4f5311236168a109ca',
            id: '60d0fe4f5311236168a109ca',
            name: 'Test Admin (API Error)',
            email: 'test@example.com',
            role: 'admin',
            avatar: {
              url: 'https://via.placeholder.com/150'
            },
            bio: 'Development test user for API errors',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as T,
        };
      }
      
      throw new Error(data.error || 'API request failed');
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    // If it's an auth error, we've already handled it
    if (error instanceof Error && error.message !== 'Authentication required') {
      console.error('API Error:', error);
    }
    
    // Special development mode fallback for auth/me endpoint
    if (process.env.NODE_ENV === 'development' && endpoint === '/auth/me') {
      console.log('Development mode: Providing error fallback for /auth/me');
      
      return {
        success: true,
        data: {
          _id: '60d0fe4f5311236168a109ca',
          id: '60d0fe4f5311236168a109ca',
          name: 'Test Admin (Error Fallback)',
          email: 'test@example.com',
          role: 'admin',
          avatar: {
            url: 'https://via.placeholder.com/150'
          },
          bio: 'Development test user after API error',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as T,
      };
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