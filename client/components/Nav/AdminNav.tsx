'use client';

import Link from 'next/link';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function AdminNav() {
  return (
    <nav className="bg-slate-800 text-slate-100 p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-semibold">
          Admin Panel
        </div>
        <Link href="/dashboard/admin" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-700 transition-colors">
          <HomeIcon className="h-5 w-5" />
          <span>Dashboard Home</span>
        </Link>
        <Link href="/" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-700 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Exit to Main Site</span>
        </Link>
      </div>
    </nav>
  );
} 