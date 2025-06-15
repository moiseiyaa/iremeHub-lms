/**
 * API client utility for making requests to the backend
 */

const API_BASE_URL = '/api/v1';

// Simple in-memory cache
const cache = {};
const CACHE_DURATION = 60 * 1000; // 1 minute cache for regular requests
const COURSE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for course data

/**
 * Handle authentication errors intelligently based on the endpoint
 * @param {string} endpoint - API endpoint that triggered the auth error
 */
const handleAuthError = (endpoint) => {
  console.log('Auth error for endpoint:', endpoint);
  
  // NEVER log out users viewing course-related pages
  if (endpoint.includes('/courses/')) {
    console.log('Preserving auth for course page');
    return; // Don't do anything - just keep the token
  }
  
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
  
  // Only remove token and redirect for strictly protected endpoints
  if (isStrictlyProtected && !isCourseEndpoint) {
    console.log('Logging out for protected endpoint:', endpoint);
    localStorage.removeItem('token');
    
    // Get current path to redirect back after login
    const currentPath = window.location.pathname;
    const redirectPath = encodeURIComponent(currentPath);
    
    // Redirect to login with return URL
    window.location.href = `/login?redirect=${redirectPath}`;
  } else {
    console.log('Preserving authentication for:', endpoint);
  }
};

/**
 * Check if this is a course-related endpoint
 * @param {string} endpoint - The API endpoint
 * @returns {boolean} - Whether it's a course endpoint
 */
const isCourseEndpoint = (endpoint) => {
  return endpoint.includes('/courses/');
};

// Check response content type before trying to parse JSON
const safeParseJson = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return { error: 'Invalid JSON response from server' };
    }
  } else {
    // Not a JSON response, return the text content as an error
    const text = await response.text();
    console.error('Non-JSON response received:', text.substring(0, 150) + '...');
    return { 
      error: 'Server returned non-JSON response', 
      html: text.substring(0, 150) + '...' 
    };
  }
};

/**
 * Make a request to the API with proper error handling
 * @param {string} endpoint - API endpoint path (without /api/v1 prefix)
 * @param {Object} options - Fetch options
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise<any>} - Response data
 */
export const apiRequest = async (endpoint, options = {}, requiresAuth = false) => {
  try {
    // SPECIAL HANDLING FOR COURSE PAGES:
    // Course pages should always work, even with authentication issues
    const isCourse = isCourseEndpoint(endpoint);
    
    // Check cache for GET requests
    const isGetRequest = !options.method || options.method === 'GET';
    const cacheKey = `${endpoint}-${requiresAuth ? 'auth' : 'noauth'}`;
    
    // Use cache for GET requests if available and still valid
    if (isGetRequest && cache[cacheKey]) {
      const { data, timestamp } = cache[cacheKey];
      const maxAge = isCourse ? COURSE_CACHE_DURATION : CACHE_DURATION;
      
      if (Date.now() - timestamp < maxAge) {
        console.log(`Using cached response for ${endpoint}`);
        return data;
      }
    }
    
    // Add timeout capability
    const controller = new AbortController();
    // Increase timeout for course endpoints to 30 seconds and all other endpoints to 15 seconds
    const timeoutDuration = isCourse ? 30000 : 15000;
    console.log(`Setting timeout to ${timeoutDuration}ms for ${endpoint}`);
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
    
    // Prepare headers
    const headers = {
      // 'Content-Type': 'application/json', // Conditionally set Content-Type later
      ...options.headers,
    };

    // Only set Content-Type to application/json if the body is not FormData
    // If body is FormData, the browser will set the correct multipart/form-data header
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Add auth token if required (and this isn't a course page)
    // For course pages, we'll include the token if available, but won't fail if it's not
    if (requiresAuth) {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Use our intelligent error handler
        handleAuthError(endpoint);
        
        // For course endpoints, just continue without auth instead of throwing
        if (isCourse) {
          console.log('Continuing with course request without auth');
          // Continue without auth for course pages 
        } else {
          throw new Error('Authentication required. Please log in.');
        }
      } else {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers, // headers now conditionally includes Content-Type
      signal: controller.signal,
    });
    
    // Clear timeout
    clearTimeout(timeoutId);
    
    // Safely parse JSON response or handle HTML responses
    const data = await safeParseJson(response);
    
    // Store successful GET responses in cache
    if (isGetRequest && response.ok && !data.error) {
      cache[cacheKey] = {
        data,
        timestamp: Date.now()
      };
      console.log(`Cached response for ${endpoint}`);
    }
    
    // Check for HTML response errors
    if (data.html) {
      console.error(`Server returned HTML instead of JSON for ${endpoint}`);
      throw new Error('Server returned HTML instead of JSON. The API server might be unavailable or misconfigured.');
    }
    
    // Check for HTTP errors
    if (!response.ok) {
      // Handle auth errors specially
      if (response.status === 401) {
        // Use our intelligent error handler instead of always removing token
        handleAuthError(endpoint);
        
        // For course endpoints, continue with public data instead of throwing
        if (isCourse) {
          console.log('Auth failed for course endpoint, falling back to public data');
          
          // If this was a with-progress request, retry without auth for public data
          if (endpoint.includes('/with-progress')) {
            const publicEndpoint = endpoint.replace('/with-progress', '');
            console.log('Retrying with public endpoint:', publicEndpoint);
            
            // Return a pending promise that will resolve with the public data
            return apiRequest(publicEndpoint, { method: 'GET' }, false);
          }
          
          // Return empty data structure that our other handlers can process
          return {
            course: data.course || {},
            isEnrolled: false,
            progress: null
          };
        }
        
        // For non-course endpoints, throw authentication error
        throw new Error('Authentication expired. Please log in again.');
      }
      
      // For course endpoints, try to return partial data even on errors
      if (isCourse) {
        console.warn(`Request failed with status ${response.status} but returning partial data`);
        return data.course ? data : { error: data.error || `Request failed with status ${response.status}` };
      }
      
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }
    
    return data;
  } catch (error) {
    // Re-throw abort errors with a clearer message
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    
    // Don't re-throw auth errors for course pages
    if (isCourseEndpoint(endpoint) && 
        (error.message.includes('Authentication') || error.message.includes('auth'))) {
      console.log('Suppressing auth error for course page:', error.message);
      return { error: error.message };
    }
    
    // Re-throw other errors
    throw error;
  }
};

/**
 * Shorthand for GET requests
 */
export const apiGet = (endpoint, requiresAuth = false) => {
  return apiRequest(endpoint, { method: 'GET' }, requiresAuth);
};

/**
 * Shorthand for POST requests
 */
export const apiPost = (endpoint, data, requiresAuth = false) => {
  return apiRequest(
    endpoint,
    {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    },
    requiresAuth
  );
};

/**
 * Shorthand for PUT requests
 */
export const apiPut = (endpoint, data, requiresAuth = false) => {
  return apiRequest(
    endpoint,
    { 
      method: 'PUT',
      body: JSON.stringify(data)
    },
    requiresAuth
  );
};

/**
 * Shorthand for DELETE requests
 */
export const apiDelete = (endpoint, requiresAuth = false) => {
  return apiRequest(endpoint, { method: 'DELETE' }, requiresAuth);
};