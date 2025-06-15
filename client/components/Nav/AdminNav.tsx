'use client';

import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/solid';
import Notifications from '../Notifications';
import Image from 'next/image';
import logoBlue from '@/public/images/iremehub-logo.png';

export default function AdminNav() {
  return (
    <nav className="bg-slate-800 text-slate-100 p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" title="Back to Main Site">
          <Image 
            src={logoBlue}
            alt="iremeHub Logo"
            width={140}
            height={40}
            placeholder="empty"
            priority
            className="transition-all duration-300"
          />
        </Link>
        
        <div className="flex items-center space-x-4">
          <Notifications />
          <Link href="/dashboard/admin" className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-700 transition-colors">
            <HomeIcon className="h-5 w-5" />
            <span>Dashboard Home</span>
          </Link>
        </div>
      </div>
    </nav>
  );
} 