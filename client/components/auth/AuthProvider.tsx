'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AuthModal from './AuthModal';
import { initActivityTracker, refreshToken } from '../../app/utils/auth';

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
    try {
      setLoading(true);
      console.log('Checking authentication status...');
      
      // Check for token in localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found in localStorage');
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      console.log('Token found, validating...');
      
      // Development mode handling - special case to ensure admin users can always access dashboard
      if (process.env.NODE_ENV === 'development') {
        try {
          console.log('Development mode: checking if token is for test user');
          
          // Try to parse the token to see if it's our test user
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            try {
              const payload = JSON.parse(atob(tokenParts[1]));
              
              // If this is our test user ID, set up mock user data
              if (payload.id === '60d0fe4f5311236168a109ca') {
                console.log('Development mode: Using test user data');
                
                // Set up mock admin user
                const testUser = {
                  id: '60d0fe4f5311236168a109ca',
                  _id: '60d0fe4f5311236168a109ca',
                  name: 'Test User (Dev)',
                  email: 'test@example.com',
                  role: 'admin',
                  avatar: {
                    url: 'https://via.placeholder.com/150'
                  },
                  bio: 'Development test user',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                
                setUser(testUser);
                setIsAuthenticated(true);
                console.log('Development mode: Test admin user authenticated');
                setLoading(false);
                return;
              }
            } catch (parseError) {
              console.log('Token parse error:', parseError);
            }
          }
        } catch (devError) {
          console.error('Error in development mode handling:', devError);
          // Continue with regular auth checking if dev mode handling fails
        }
      }
      
      try {
        // Refresh token if needed
        await refreshToken();
        
        // Get user data
        console.log('Fetching user data...');
        const response = await fetch('/api/v1/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('User data received:', userData);
          
          // Validate user data before setting it
          if (userData.data && typeof userData.data === 'object') {
            setUser(userData.data);
            setIsAuthenticated(true);
            console.log('User authenticated successfully');
          } else {
            console.error('Invalid user data format:', userData);
            
            // Development mode fallback when API returns invalid data
            if (process.env.NODE_ENV === 'development') {
              console.log('Development mode: Using fallback user data');
              const fallbackUser = {
                id: '60d0fe4f5311236168a109ca',
                _id: '60d0fe4f5311236168a109ca',
                name: 'Test User (Fallback)',
                email: 'test@example.com',
                role: 'admin',
                avatar: {
                  url: 'https://via.placeholder.com/150'
                },
                bio: 'Development fallback user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              
              setUser(fallbackUser);
              setIsAuthenticated(true);
              console.log('Development fallback user authenticated');
            } else {
              setIsAuthenticated(false);
              setUser(null);
            }
          }
        } else {
          // If token is invalid, check for development mode
          console.error('Invalid token response:', response.status);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Creating fallback user despite invalid token');
            const fallbackUser = {
              id: '60d0fe4f5311236168a109ca',
              _id: '60d0fe4f5311236168a109ca',
              name: 'Test User (API Error)',
              email: 'test@example.com',
              role: 'admin',
              avatar: {
                url: 'https://via.placeholder.com/150'
              },
              bio: 'Development fallback user (API error)',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            setUser(fallbackUser);
            setIsAuthenticated(true);
            console.log('Development fallback user authenticated (API error)');
          } else {
            // Regular handling for production - clear token and reset auth state
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch (fetchError) {
        console.error('Error fetching user data:', fetchError);
        
        // Development mode fallback for fetch errors
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: Creating fallback user after fetch error');
          const fallbackUser = {
            id: '60d0fe4f5311236168a109ca',
            _id: '60d0fe4f5311236168a109ca',
            name: 'Test User (Fetch Error)',
            email: 'test@example.com',
            role: 'admin',
            avatar: {
              url: 'https://via.placeholder.com/150'
            },
            bio: 'Development fallback user (fetch error)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          setUser(fallbackUser);
          setIsAuthenticated(true);
          console.log('Development fallback user authenticated (fetch error)');
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (error) {
      // Log the error but don't expose it to the client
      console.error('Auth check failed:', error);
      
      // Development mode final fallback
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Final fallback user after auth check failure');
        const finalFallbackUser = {
          id: '60d0fe4f5311236168a109ca',
          _id: '60d0fe4f5311236168a109ca',
          name: 'Test User (Error)',
          email: 'test@example.com',
          role: 'admin',
          avatar: {
            url: 'https://via.placeholder.com/150'
          },
          bio: 'Development final fallback user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setUser(finalFallbackUser);
        setIsAuthenticated(true);
        console.log('Development final fallback user authenticated');
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
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