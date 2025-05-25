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
  const [debugInfo, setDebugInfo] = useState('');

  // Direct test function for debugging
  const testApiDirectly = async () => {
    setError('');
    setDebugInfo('Starting direct API test...');
    
    try {
      // Try direct call to the server
      const baseUrl = 'http://localhost:5001';
      setDebugInfo(prev => prev + `\nSending request to: ${baseUrl}/api/v1/auth/forgotpassword`);
      
      const response = await fetch(`${baseUrl}/api/v1/auth/forgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email || 'test@example.com' }),
      });
      
      setDebugInfo(prev => prev + `\nResponse status: ${response.status}`);
      
      const text = await response.text();
      setDebugInfo(prev => prev + `\nRaw response: ${text}`);
      
      try {
        const data = JSON.parse(text);
        setDebugInfo(prev => prev + `\nParsed data: ${JSON.stringify(data, null, 2)}`);
      } catch (e) {
        setDebugInfo(prev => prev + `\nFailed to parse JSON: ${e instanceof Error ? e.message : String(e)}`);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setDebugInfo(prev => prev + `\nError: ${errorMessage}`);
      setError(`Direct API test failed: ${errorMessage}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    setDebugInfo('Submitting forgot password form...');

    try {
      // Try with relative URL first - this should work with proper proxy setup
      const apiUrl = '/api/v1/auth/forgotpassword';
      setDebugInfo(prev => prev + `\nSending request to: ${apiUrl}`);
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      setDebugInfo(prev => prev + `\nResponse status: ${res.status}`);
      
      let data;
      try {
        const text = await res.text();
        setDebugInfo(prev => prev + `\nRaw response: ${text}`);
        data = JSON.parse(text);
      } catch (err) {
        setDebugInfo(prev => prev + `\nError parsing response: ${err instanceof Error ? err.message : String(err)}`);
        throw new Error('Invalid response from server');
      }

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to send password reset email');
      }

      setSuccess(true);
      setDebugInfo(prev => prev + '\nPassword reset request successful');
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      setDebugInfo(prev => prev + `\nError: ${errorMessage}`);
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
              Enter your email address and we&apos;ll send you a link to reset your password
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
          
          {/* Debug information */}
          {debugInfo && (
            <div className="mb-4 p-3 bg-gray-100 border border-gray-400 text-gray-700 rounded text-xs overflow-auto max-h-40">
              <pre>{debugInfo}</pre>
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
            
            {/* Test button - only shown in development */}
            <div className="mt-2">
              <button
                type="button"
                onClick={testApiDirectly}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0091ff]"
              >
                Test API Directly (Debug)
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
            <p className="text-white text-lg drop-shadow-md">Don&apos;t worry! It happens to the best of us. We&apos;ll help you get back into your account.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 