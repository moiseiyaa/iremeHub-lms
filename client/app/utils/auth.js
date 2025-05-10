/**
 * Authentication utilities for token management and session handling
 */

// Track the last time the user was active
let lastActivityTime = Date.now();
let tokenRefreshInterval = null;
const INACTIVITY_THRESHOLD = 30 * 60 * 1000; // 30 minutes in milliseconds
const TOKEN_REFRESH_INTERVAL = 25 * 60 * 1000; // 25 minutes in milliseconds

/**
 * Initialize the activity tracker and token refresh mechanism
 */
export const initActivityTracker = () => {
  if (typeof window === 'undefined') return; // Don't run in SSR

  // Update last activity time on user interactions
  const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
  
  activityEvents.forEach(event => {
    window.addEventListener(event, updateLastActivityTime);
  });
  
  // Set up interval to check token expiration and refresh if needed
  tokenRefreshInterval = setInterval(checkTokenAndRefresh, 60000); // Check every minute
  
  // Also update on page load
  updateLastActivityTime();
  
  return () => {
    // Cleanup function
    activityEvents.forEach(event => {
      window.removeEventListener(event, updateLastActivityTime);
    });
    
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval);
    }
  };
};

/**
 * Update the timestamp of the most recent user activity
 */
const updateLastActivityTime = () => {
  lastActivityTime = Date.now();
};

/**
 * Check if the token needs refreshing based on activity
 */
const checkTokenAndRefresh = async () => {
  const token = localStorage.getItem('token');
  if (!token) return; // No token to refresh
  
  const currentTime = Date.now();
  const timeSinceLastActivity = currentTime - lastActivityTime;
  
  // If user has been inactive for longer than the threshold, don't refresh
  if (timeSinceLastActivity > INACTIVITY_THRESHOLD) {
    return;
  }
  
  // Only refresh token if user is active and token is approaching expiry
  // We assume token was refreshed on the last activity
  if (timeSinceLastActivity < TOKEN_REFRESH_INTERVAL) {
    try {
      // Try to refresh with retries
      await refreshTokenWithRetry();
      console.log('Token refreshed successfully');
    } catch (error) {
      // Log the error but don't prevent user from continuing
      console.log('Failed to refresh token, but continuing:', error.message);
    }
  }
};

/**
 * Retry the token refresh with exponential backoff
 */
const refreshTokenWithRetry = async (retries = 3, delay = 1000) => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    console.log('Attempting to refresh token...');
    
    // Always check if we're in development mode first for test users
    if (process.env.NODE_ENV === 'development') {
      // Try to parse the current token to check if it's a dev token
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          
          // If this is our dev test user ID, just create a new dev token
          if (payload.id === '60d0fe4f5311236168a109ca') {
            console.log('Development mode: refreshing test user token');
            
            // Create a new mock token that would normally come from the server
            const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
              id: '60d0fe4f5311236168a109ca',
              role: 'admin',
              exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 // 30 days from now
            }))}.dev_signature`;
            
            localStorage.setItem('token', mockToken);
            return true;
          }
        }
      } catch (parseError) {
        console.log('Token parse error, will try regular refresh:', parseError);
        // Continue with regular token refresh if parsing fails
      }
    }
    
    // Regular token refresh API call
    const response = await fetch('/api/v1/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Check if we got a JSON response
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response from token refresh endpoint');
      
      // For dev mode, create a fallback token instead of throwing
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Using fallback token due to non-JSON response');
        const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
          id: '60d0fe4f5311236168a109ca',
          role: 'admin',
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 // 30 days from now
        }))}.dev_signature`;
        
        localStorage.setItem('token', mockToken);
        return true;
      }
      
      throw new Error('Invalid response format from server');
    }
    
    const data = await response.json();
    console.log('Token refresh response:', data.success);
    
    if (response.ok && data.token) {
      console.log('Token refreshed successfully');
      localStorage.setItem('token', data.token);
      return true;
    }
    throw new Error(data.error || 'Token refresh failed');
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    
    // Special handling for development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Creating emergency fallback token');
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
        id: '60d0fe4f5311236168a109ca',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 // 30 days from now
      }))}.dev_signature`;
      
      localStorage.setItem('token', mockToken);
      return true;
    }
    
    // Handle "User not found" error by clearing the token to trigger a new login
    if (error.message.includes('User not found')) {
      console.log('User not found in database, clearing token to prompt re-login');
      localStorage.removeItem('token');
      return false;
    }
    
    // Check for network errors (which indicate server connectivity issues)
    if (
      error.name === 'TypeError' || 
      error.message === 'Failed to fetch' ||
      error.message.includes('ERR_INTERNET_DISCONNECTED') ||
      error.message.includes('NetworkError')
    ) {
      console.log(`Network error during token refresh, retries left: ${retries}`);
      
      // If we have retries left, wait and try again
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return refreshTokenWithRetry(retries - 1, delay * 2);
      }
    }
    
    // Re-throw all other errors or if retries are exhausted
    throw error;
  }
};

/**
 * Manually refresh the token (for immediate refresh)
 */
export const refreshToken = async () => {
  updateLastActivityTime(); // Update activity time
  
  try {
    console.log('Token refresh triggered manually');
    const result = await refreshTokenWithRetry();
    return result;
  } catch (error) {
    console.error('Failed to refresh token:', error.message);
    
    // Special handling for development mode to prevent login loops
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Providing emergency token instead of clearing');
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
        id: '60d0fe4f5311236168a109ca',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 // 30 days from now
      }))}.dev_signature`;
      
      localStorage.setItem('token', mockToken);
      return true;
    }
    
    // If the token refresh fails, we should clear the token to force re-login
    if (error.message.includes('jwt expired') || error.message.includes('invalid token')) {
      console.log('Clearing expired token');
      localStorage.removeItem('token');
    }
    return false;
  }
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

/**
 * Log the user out
 */
export const logout = () => {
  localStorage.removeItem('token');
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
  }
  
  // Redirect to login page (if using)
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};
