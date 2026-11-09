'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import BrandMark from '../ui/BrandMark';
import Notifications from '../Notifications';
import { useAuth } from '../auth/AuthProvider';

const links = [
  { label: 'Home', href: '/' },
  { label: 'Explore courses', href: '/courses' },
  { label: 'About', href: '/about' },
  { label: 'Journal', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, loading, logout } = useAuth();
  return (
    <header className="ih-site-nav">
      <div className="ih-container flex h-[76px] items-center justify-between gap-5">
        <BrandMark />
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {links.map(item => (
            <Link key={item.href} href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
              className="ih-nav-link">{item.label}</Link>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          {loading ? <div className="ih-skeleton h-10 w-28" aria-hidden="true" /> :
            isAuthenticated ? <>
              <Notifications />
              <Link href="/dashboard" className="ih-btn ih-btn-neutral !min-h-[42px]">
                <UserCircleIcon className="h-5 w-5" />
                <span className="max-w-[120px] truncate">{user?.name || 'Workspace'}</span>
              </Link>
              <button type="button" onClick={logout} aria-label="Sign out" className="p-2.5 rounded-xl text-[#50685c] hover:bg-[#edf4ed]"><ArrowRightOnRectangleIcon className="w-5 h-5" /></button>
            </> : <>
              <Link href="/login" className="ih-nav-link">Sign in</Link>
              <Link href="/register" className="ih-btn ih-btn-primary !min-h-[42px]">Get started <span aria-hidden="true">↗</span></Link>
            </>}
        </div>
        <button type="button" className="lg:hidden p-2.5 border border-[#dfe7e0] rounded-xl" onClick={() => setOpen(v => !v)}
          aria-expanded={open} aria-controls="ih-mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>
      {open && <nav id="ih-mobile-nav" className="lg:hidden ih-container pb-5 flex flex-col gap-1" aria-label="Mobile navigation">
        {links.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
          aria-current={pathname === item.href ? 'page' : undefined} className="ih-nav-link">{item.label}</Link>)}
        <div className="border-t border-[#e1e9e2] pt-3 mt-2 flex gap-2">
          {isAuthenticated ? <>
            <Link href="/dashboard" onClick={() => setOpen(false)} className="ih-btn ih-btn-primary flex-1">My workspace</Link>
            <button type="button" onClick={() => { setOpen(false); logout(); }} className="ih-btn ih-btn-neutral">Sign out</button>
          </> : <>
            <Link href="/login" onClick={() => setOpen(false)} className="ih-btn ih-btn-neutral flex-1">Sign in</Link>
            <Link href="/register" onClick={() => setOpen(false)} className="ih-btn ih-btn-primary flex-1">Get started</Link>
          </>}
        </div>
      </nav>}
    </header>
  );
}
