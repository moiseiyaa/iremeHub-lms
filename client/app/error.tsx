'use client';
import Link from 'next/link';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function GlobalError({error,reset}:{error:Error & {digest?:string};reset:()=>void}){
  return <div className="bg-[#f5f7f2] min-h-[65vh] flex items-center py-16" role="alert"><div className="ih-container max-w-2xl text-center"><div className="mx-auto w-16 h-16 rounded-3xl bg-[#fff0e7] grid place-items-center"><ExclamationTriangleIcon className="h-8 w-8 text-[#a16443]"/></div><h1 className="ih-heading mt-7">Something went wrong.</h1><p className="ih-lead mt-4 mx-auto">We couldn't load this part of iremehub+. You can try again or return to the homepage.</p><div className="flex flex-wrap gap-3 justify-center mt-8"><button type="button" className="ih-btn ih-btn-primary" onClick={reset}><ArrowPathIcon className="w-5 h-5"/> Try again</button><Link href="/" className="ih-btn ih-btn-neutral">Go home</Link></div></div></div>;
}
