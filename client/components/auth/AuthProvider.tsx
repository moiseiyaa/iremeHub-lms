'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AuthModal from './AuthModal';
import { initActivityTracker } from '../../app/utils/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: {
    public_id?: string;
    url: string;
  } | string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeAuthModal: () => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
    const cleanup = initActivityTracker();
    return cleanup;
  }, []);

  // Don't show the modal on login or register pages - no longer needed since we're redirecting
  // useEffect(() => {
  //   if (pathname === '/login' || pathname === '/register') {
  //     setIsModalOpen(false);
  //   }
  // }, [pathname]);

  const checkAuth = async () => {
    setLoading(true);
    try {
      // A token alone is not proof of authentication. Always verify with the API.
      const token = window.localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          window.localStorage.removeItem('token');
        }
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      const payload = await response.json();
      if (!payload?.data || typeof payload.data !== 'object') {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      setUser(payload.data as User);
      setIsAuthenticated(true);
    } catch {
      // Network failures must not manufacture an authenticated user.
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const openLoginModal = () => {
    console.log('Opening login modal');
    setAuthMode('login');
    setIsModalOpen(true);
  };

  const openRegisterModal = () => {
    console.log('Opening register modal');
    setAuthMode('register');
    setIsModalOpen(true);
  };

  const closeAuthModal = () => {
    console.log('Closing auth modal');
    setIsModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    
    // Redirect to home page if on protected route
    if (pathname?.includes('/dashboard')) {
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        user,
        openLoginModal,
        openRegisterModal,
        closeAuthModal,
        logout,
        checkAuth
      }}
    >
      {children}
      
      {/* Auth Modal - globally available */}
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={closeAuthModal} 
        initialMode={authMode}
      />
    </AuthContext.Provider>
  );
} 