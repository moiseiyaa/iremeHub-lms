'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import AdminNav from '../Nav/AdminNav';

export default function ConditionalHeader() {
  const path = usePathname() || '';
  if (/^\/courses\/[^/]+\/learn(?:\/|$)/.test(path)) return null;
  if (path.startsWith('/dashboard/admin')) return <AdminNav />;
  return <Header />;
}
