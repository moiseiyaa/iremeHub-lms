'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const path = usePathname() || '';
  if (path.startsWith('/dashboard') || /^\/courses\/[^/]+\/learn(?:\/|$)/.test(path)) return null;
  return <Footer />;
}
