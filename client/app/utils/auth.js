/**
 * Legacy temporary token utilities.
 * No development-mode impersonation or fabricated tokens are permitted.
 * Replace with revocable, HttpOnly server sessions in the Phase 2 auth upgrade.
 */
let lastActivity = Date.now();
let refreshTimer = null;
const INACTIVITY_LIMIT = 30 * 60 * 1000;
const REFRESH_CHECK = 60 * 1000;

export const refreshToken = async () => {
  if (typeof window === 'undefined') return false;
  const token = window.localStorage.getItem('token');
  if (!token) return false;

  try {
    const response = await fetch('/api/v1/auth/refresh-token', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        window.localStorage.removeItem('token');
      }
      return false;
    }
    const data = await response.json();
    if (!data?.token || typeof data.token !== 'string') return false;
    window.localStorage.setItem('token', data.token);
    return true;
  } catch {
    return false;
  }
};

export const initActivityTracker = () => {
  if (typeof window === 'undefined') return () => {};
  const activity = () => { lastActivity = Date.now(); };
  for (const name of ['mousedown', 'keydown', 'touchstart', 'click']) {
    window.addEventListener(name, activity, { passive: true });
  }
  // Do not refresh every minute; only near expiry as judged by a server-issued JWT.
  refreshTimer = window.setInterval(async () => {
    const token = window.localStorage.getItem('token');
    if (!token || Date.now() - lastActivity > INACTIVITY_LIMIT) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      if (typeof payload.exp === 'number' && payload.exp * 1000 - Date.now() <= 5 * 60 * 1000) {
        await refreshToken();
      }
    } catch {
      // Invalid token: never fabricate a replacement.
    }
  }, REFRESH_CHECK);
  return () => {
    for (const name of ['mousedown', 'keydown', 'touchstart', 'click']) {
      window.removeEventListener(name, activity);
    }
    if (refreshTimer !== null) window.clearInterval(refreshTimer);
    refreshTimer = null;
  };
};

export const isAuthenticated = () =>
  typeof window !== 'undefined' && !!window.localStorage.getItem('token');

export const logout = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('token');
  if (refreshTimer !== null) window.clearInterval(refreshTimer);
  window.location.href = '/login';
};
