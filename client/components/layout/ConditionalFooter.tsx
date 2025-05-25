'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer'; // Your existing main Footer

export default function ConditionalFooter() {
  const pathname = usePathname();
  // Ensure pathname is not null before calling startsWith
  const isAdminRoute = typeof pathname === 'string' && pathname.startsWith('/dashboard/admin');

  if (isAdminRoute) {
    return null; // Don't render footer on admin routes
  }

  return <Footer />;
} 