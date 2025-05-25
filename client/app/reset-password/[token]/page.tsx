'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LockClosedIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function ResetPassword() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Invalid password reset link. Please request a new one.');
      return;
    }
  }, [token]);

  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback('');
      return;
    }

    let strength = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) {
      strength += 25;
    } else {
      feedback.push('Use at least 8 characters');
    }

    // Uppercase letters check
    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('Add uppercase letters');
    }

    // Numbers check
    if (/[0-9]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('Add numbers');
    }

    // Special characters check
    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 25;
    } else {
      feedback.push('Add special characters');
    }

    setPasswordStrength(strength);
    setPasswordFeedback(feedback.join(' • '));
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5001/api/v1/auth/resetpassword/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to reset password');
      }

      setSuccess(true);
      
      // Automatically redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'An error occurred while resetting your password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-white">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-10">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Reset your password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Create a new password for your account
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success ? (
            <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mb-3 mx-auto" />
              <h3 className="text-lg font-medium text-green-800 mb-2">Password reset successful!</h3>
              <p className="text-sm text-green-700 mb-4">
                Your password has been successfully updated. You can now login with your new password.
              </p>
              <Link 
                href="/login" 
                className="inline-block w-full py-3 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition"
              >
                Continue to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0091ff] focus:border-transparent sm:text-sm"
                    required
                    autoComplete="new-password"
                  />
                </div>
                
                {/* Password strength meter */}
                {password && (
                  <div className="mt-2">
                    <div className="h-2 w-full bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          passwordStrength <= 25 ? 'bg-red-500' : 
                          passwordStrength <= 50 ? 'bg-orange-500' : 
                          passwordStrength <= 75 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{passwordFeedback || 'Strong password'}</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      confirmPassword && password !== confirmPassword 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-[#0091ff]'
                    } rounded-md focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm`}
                    required
                    autoComplete="new-password"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">Passwords don't match</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !tokenValid}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0091ff] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0091ff] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <div className="text-sm">
              <Link href="/login" className="font-medium text-[#0091ff] hover:text-blue-500 transition">
                Remember your password? Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block lg:flex-1 relative">
        <div className="absolute inset-0 bg-blue-500/10 z-0"></div>
        <Image
          className="absolute inset-0 h-full w-full object-cover z-[-1]"
          src="https://placehold.co/1200x800/0091ff/FFFFFF/png?text=Reset+Your+Password"
          alt="Reset Your Password"
          width={1200}
          height={800}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-md">Create a New Password</h2>
            <p className="text-white text-lg drop-shadow-md">
              Choose a strong, unique password to keep your account secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 