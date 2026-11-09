'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon, ClockIcon, AcademicCapIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';

export default function WaitingClient(){
 const params=useSearchParams();
 const courseId=params?.get('course')||'';
 const courseHref=courseId && /^[a-zA-Z0-9_-]+$/.test(courseId)?`/courses/${courseId}`:'/courses';
 return <div className="min-h-[75vh] bg-[#f5f7f2] py-12 lg:py-20 flex items-center"><div className="ih-container max-w-[660px]">
  <div className="ih-card p-8 sm:p-12 text-center">
   <div className="h-20 w-20 rounded-[25px] bg-[#dcefdc] mx-auto flex items-center justify-center"><CheckCircleIcon className="w-11 h-11 text-[#368658]"/></div>
   <span className="ih-eyebrow !flex justify-center mt-8">Enrollment request</span>
   <h1 className="text-3xl sm:text-4xl font-extrabold tracking-[-.055em] mt-5">Your request is on its way.</h1>
   <p className="text-[#6f8475] text-base leading-8 mt-5 max-w-lg mx-auto">Your enrollment request was submitted. The course educator will review your request, and you can check your notifications for a decision.</p>
   <div className="bg-[#f0f6ed] rounded-2xl mt-8 p-5 text-left flex gap-4"><ClockIcon className="h-6 w-6 text-[#2d7c54] shrink-0"/><div><p className="font-bold text-sm">What happens next?</p><p className="text-[#768976] leading-7 text-sm mt-1">When approved, the learning material becomes available in your course workspace.</p></div></div>
   <div className="flex flex-wrap justify-center gap-3 mt-8"><Link href={courseHref} className="ih-btn ih-btn-primary">Back to course <ArrowUpRightIcon className="w-4 h-4"/></Link><Link href="/dashboard" className="ih-btn ih-btn-neutral"><AcademicCapIcon className="w-5 h-5"/> My learning</Link></div>
  </div>
 </div></div>;
}
