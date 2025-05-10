'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/auth/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { openLoginModal } = useAuth();

  useEffect(() => {
    // Redirect to home page and open login modal
    router.push('/');
    // Slight delay to ensure navigation happens first
    setTimeout(() => {
      openLoginModal();
    }, 100);
  }, [router, openLoginModal]);

  // Return empty div while redirecting
  return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
} 