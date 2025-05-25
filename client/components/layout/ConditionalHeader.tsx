'use client';

import { usePathname } from 'next/navigation';
import Header from './Header'; // Your existing main Header/Navbar
import AdminNav from '../Nav/AdminNav'; // The new AdminNav

export default function ConditionalHeader() {
  const pathname = usePathname();
  // Ensure pathname is not null before calling startsWith
  const isAdminRoute = typeof pathname === 'string' && pathname.startsWith('/dashboard/admin');

  if (isAdminRoute) {
    return <AdminNav />;
  }

  return <Header />;
} 