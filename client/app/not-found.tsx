import Link from 'next/link';
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function NotFound(){
  return <main className="min-h-[70vh] bg-[#f5f7f2] flex items-center py-16"><div className="ih-container max-w-3xl text-center"><div className="inline-flex w-20 h-20 rounded-3xl bg-[#e5f1e5] items-center justify-center"><MagnifyingGlassIcon className="w-9 h-9 text-[#3e8e5d]"/></div><span className="ih-eyebrow mt-8 !flex justify-center">Page not found · 404</span><h1 className="ih-heading mt-6">Looks like this page has moved.</h1><p className="ih-lead mt-4 mx-auto">The page you requested may no longer exist. Try returning home or explore the course catalog.</p><div className="flex flex-wrap gap-3 justify-center mt-8"><Link href="/" className="ih-btn ih-btn-primary"><ArrowLeftIcon className="w-5 h-5"/> Back to home</Link><Link href="/courses" className="ih-btn ih-btn-neutral">Explore courses</Link></div></div></main>;
}
