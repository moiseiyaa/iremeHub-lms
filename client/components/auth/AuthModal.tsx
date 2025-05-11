'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  XMarkIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useAuth } from './AuthProvider';

type AuthMode = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const handleClose = useCallback(() => {
    if (!loading) {
      setIsClosing(true);
      
      // Wait for animation to complete before actually closing
      setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 300); // Match this with the CSS animation duration
    }
  }, [loading, onClose]);
  
  // Log modal status for debugging
  useEffect(() => {
    console.log(`Auth modal isOpen: ${isOpen}, mode: ${mode}`);
    
    // Reset closing state when modal opens
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen, mode]);
  
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setLoading(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [isOpen]);

  // Update mode when initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);
  
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, isClosing, handleClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking on the overlay, not the modal itself
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Create an AbortController to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const endpoint = mode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const payload = mode === 'login' 
        ? { email: formData.email, password: formData.password } 
        : { name: formData.name, email: formData.email, password: formData.password };

      console.log(`Submitting ${mode} request to ${endpoint}`);
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      // Clear the timeout since the request completed
      clearTimeout(timeoutId);

      // Check content type to handle non-JSON responses
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Handle non-JSON response
        const textResponse = await res.text();
        console.error('Non-JSON auth response:', textResponse.substring(0, 100));
        throw new Error('Server returned an invalid response. Please try again later.');
      }

      const data = await res.json();
      console.log(`${mode} response:`, data);

      if (!res.ok) {
        throw new Error(data.error || `${mode === 'login' ? 'Login' : 'Registration'} failed`);
      }

      // Always store token in localStorage for consistent access
      localStorage.setItem('token', data.token);
      console.log('Token stored in localStorage');
      
      // Immediately reload auth state to show nav profile icon
      await checkAuth();
      console.log('Auth state checked after login');
      
      // Close modal and redirect
      handleClose();
      console.log('Redirecting to dashboard');
      router.push('/dashboard');
    } catch (err: unknown) {
      // Clear the timeout if there was an error
      clearTimeout(timeoutId);
      
      // Handle AbortController timeout error
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.error('Request timed out');
        setError('Request timed out. Please check your internet connection and try again.');
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      console.error(`${mode} error:`, errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out auth-overlay${isClosing ? ' closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className={`relative bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-md transition-all duration-300 ease-out auth-modal${isClosing ? ' closing' : ''}`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        
        {/* Top banner */}
        <div className="bg-[#0091ff] p-6 pb-4 text-white text-center relative">
          <div className="flex justify-center mb-3">
            <Image 
              src="/images/iremehub-logo-white.png" 
              alt="iremeHub Logo" 
              width={130} 
              height={40} 
              className="h-8 w-auto"
            />
          </div>
          <h2 className="font-bold text-xl">
            {mode === 'login' ? 'Sign In to Your Account' : 'Create an Account'}
          </h2>
        </div>
        
        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 sm:text-sm border border-gray-300 rounded-md py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0091ff] focus:border-transparent auth-input"
                  placeholder="Full Name"
                />
              </div>
            )}

            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-10 sm:text-sm border border-gray-300 rounded-md py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0091ff] focus:border-transparent auth-input"
                placeholder="Email address"
              />
            </div>

            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              {mode === 'login' ? (
                // Login password field with current-password autocomplete
                <input
                  id="current-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 sm:text-sm border border-gray-300 rounded-md py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0091ff] focus:border-transparent auth-input"
                  placeholder="Password"
                />
              ) : (
                // Registration password field with new-password autocomplete
              <input
                  id="new-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-10 pr-10 sm:text-sm border border-gray-300 rounded-md py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0091ff] focus:border-transparent auth-input"
                placeholder="Password"
              />
              )}
              <button
                type="button"
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {mode === 'register' && (
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 sm:text-sm border border-gray-300 rounded-md py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0091ff] focus:border-transparent auth-input"
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                    className="h-4 w-4 text-[#0091ff] focus:ring-[#0091ff] border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <button 
                  type="button"
                  className="font-medium text-[#0091ff] hover:text-blue-500"
                  onClick={() => {/* TODO: Forgot password */}}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#0091ff] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0091ff] disabled:opacity-50 disabled:cursor-not-allowed auth-button"
              >
                {loading 
                  ? (mode === 'login' ? 'SIGNING IN...' : 'REGISTERING...') 
                  : (mode === 'login' ? 'SIGN IN' : 'SIGN UP')}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              className="ml-1 text-sm font-medium text-[#0091ff] hover:text-blue-500"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>

          {mode === 'login' && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <button 
                  type="button"
                  aria-label="Sign in with Google"
                  className="rounded-md w-full py-2 px-3 bg-white flex items-center justify-center border border-gray-300 hover:border-gray-400 auth-button">
                  <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                    <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                    <path d="M5.26498 14.2949C5.02498 13.5699 4.88495 12.7999 4.88495 11.9999C4.88495 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                    <path d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.25 12.0004 19.25C8.8704 19.25 6.21537 17.14 5.2654 14.295L1.27539 17.39C3.25539 21.31 7.3104 24 12.0004 24Z" fill="#34A853" />
                  </svg>
                </button>
                <button 
                  type="button"
                  aria-label="Sign in with Facebook"
                  className="rounded-md w-full py-2 px-3 bg-white flex items-center justify-center border border-gray-300 hover:border-gray-400 auth-button">
                  <svg className="h-5 w-5 text-[#1877F2]" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </button>
                <button 
                  type="button"
                  aria-label="Sign in with GitHub"
                  className="rounded-md w-full py-2 px-3 bg-white flex items-center justify-center border border-gray-300 hover:border-gray-400 auth-button">
                  <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 