'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EnvelopeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // This endpoint doesn't exist yet, will need to be implemented in the backend
      const res = await fetch('/api/v1/auth/forgotpassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send password reset email');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
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
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              Password reset link has been sent to your email address.
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border border-gray-300 rounded-md py-3 focus:outline-none focus:ring-2 focus:ring-[#0091ff] focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0091ff] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending email...' : 'Send reset link'}
                {!loading && <ArrowRightIcon className="ml-2 h-4 w-4" />}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm">
              <Link href="/login" className="font-medium text-[#0091ff] hover:text-blue-500">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block lg:flex-1 relative">
        <div className="absolute inset-0 bg-[#0091ff]/10 z-0"></div>
        <Image
          className="absolute inset-0 h-full w-full object-cover z-[-1]"
          src="https://placehold.co/1200x800/0091ff/FFFFFF/png?text=Reset+Your+Password"
          alt="Reset Your Password"
          width={1200}
          height={800}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-md">Forgot Your Password?</h2>
            <p className="text-white text-lg drop-shadow-md">Don't worry! It happens to the best of us. We'll help you get back into your account.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 