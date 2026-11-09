'use client';

import Link from 'next/link';
import BrandMark from '../ui/BrandMark';
import Notifications from '../Notifications';

export default function AdminNav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[#dfe7e0]" aria-label="Admin navigation">
      <div className="ih-container min-h-[70px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BrandMark />
          <span className="hidden sm:inline text-xs text-[#75887e] border-l border-[#dfe7e0] pl-4 font-semibold uppercase tracking-[.12em]">Administration</span>
        </div>
        <div className="flex items-center gap-3">
          <Notifications />
          <Link href="/dashboard/admin" className="ih-btn ih-btn-neutral !min-h-[40px]">Overview</Link>
        </div>
      </div>
    </nav>
  );
}
