'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/auth/AuthProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { openRegisterModal } = useAuth();

  useEffect(() => {
    // Redirect to home page and open register modal
    router.push('/');
    // Slight delay to ensure navigation happens first
    setTimeout(() => {
      openRegisterModal();
    }, 100);
  }, [router, openRegisterModal]);

  // Return empty div while redirecting
  return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
} 