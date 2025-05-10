'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ChangePassword() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { currentPassword, newPassword, confirmPassword } = formData;

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      const res = await fetch('/api/v1/auth/updatepassword', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }
      
      // Success - clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setSuccess('Password updated successfully!');
      
      // Update token in localStorage if a new one is returned
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-[calc(100vh-64px)] py-10">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#0091ff]/90 to-blue-700/80 px-6 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Change Password</h1>
              <p className="mt-2 text-sm text-blue-100">
                Update your password to keep your account secure
              </p>
            </div>
          </div>
          
          <div className="px-6 py-8">
            {error && (
              <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 sm:text-sm border border-gray-300 rounded-md py-3 focus:outline-none focus:ring-2 focus:ring-[#0091ff] focus:border-transparent"
                    placeholder="Current Password"
                  />
                </div>
              </div>

              <div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 sm:text-sm border border-gray-300 rounded-md py-3 focus:outline-none focus:ring-2 focus:ring-[#0091ff] focus:border-transparent"
                    placeholder="New Password"
                  />
                </div>
              </div>

              <div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 sm:text-sm border border-gray-300 rounded-md py-3 focus:outline-none focus:ring-2 focus:ring-[#0091ff] focus:border-transparent"
                    placeholder="Confirm New Password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/profile"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Profile
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0091ff] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0091ff] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <div className="flex items-center justify-center text-sm text-gray-500">
                <p>Remember to use a strong password that combines uppercase and lowercase letters, numbers, and special characters.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 