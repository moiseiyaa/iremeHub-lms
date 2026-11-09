'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AcademicCapIcon, ArrowUpRightIcon, ArrowPathIcon, CalendarDaysIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { apiGet } from '../api/apiClient';

interface Certificate {
 _id:string;
 certificateId:string;
 issuedAt:string;
 course?:{_id:string;title:string;category?:string;level?:string};
 metadata?:{grade?:string;courseCompletionDate?:string;hoursCompleted?:number}
}
export default function CertificatesPage(){
 const router=useRouter();
 const [certificates,setCertificates]=useState<Certificate[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [refresh,setRefresh]=useState(0);
 useEffect(()=>{let active=true;
   if(!window.localStorage.getItem('token')){router.replace('/login?redirect=%2Fcertificates');return;}
   (async()=>{setLoading(true);setError('');
     const result=await apiGet<Certificate[]>('/certificates/my',true);
     if(!active)return;
     if(result.success&&Array.isArray(result.data))setCertificates(result.data);
     else setError(result.error||'Certificates could not be loaded.');
     setLoading(false);
   })();
   return()=>{active=false};
 },[router,refresh]);
 return <div className="min-h-[75vh] bg-[#f5f7f2]">
  <header className="bg-[#133d30] py-14 lg:py-20 text-white"><div className="ih-container"><span className="text-xs font-bold uppercase tracking-[.14em] text-[#b4d2bd]">Your achievements</span><h1 className="text-4xl sm:text-5xl font-extrabold tracking-[-.05em] mt-4">Certificates & milestones.</h1><p className="text-[#bad2c0] text-base mt-4 max-w-xl leading-7">The accomplishments you've earned through your learning journey.</p></div></header>
  <div className="ih-container py-12 lg:py-16">
   <div className="flex flex-wrap items-center justify-between gap-5 mb-8"><div><span className="ih-eyebrow">Achievement library</span><h2 className="mt-3 text-2xl font-bold tracking-tight">Your certificates</h2><p className="text-sm ih-muted mt-2">{certificates.length} {certificates.length===1?'certificate':'certificates'} available</p></div><Link href="/dashboard" className="ih-btn ih-btn-neutral">Back to dashboard</Link></div>
   {error&&<p role="alert" className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4 text-sm mb-5">{error}<button type="button" onClick={()=>setRefresh(v=>v+1)} className="ml-3 underline font-bold">Try again</button></p>}
   {loading?<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Loading certificates">{[1,2,3].map(i=><div key={i} className="ih-skeleton h-[320px]"/>)}</div>:certificates.length===0?<div className="ih-empty"><AcademicCapIcon className="h-11 w-11 text-[#4f956b]"/><h3 className="mt-5 text-xl font-bold">{error?'Unable to display certificates':'Your achievements start here'}</h3><p className="text-sm ih-muted mt-2 max-w-md">{error?'Please retry loading your certificates.':'Complete an eligible course to earn your first certificate, then find it here.'}</p><Link href="/courses" className="ih-btn ih-btn-primary mt-6">Explore courses <ArrowUpRightIcon className="h-4 w-4"/></Link></div>:
   <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{certificates.map(cert=><article key={cert._id} className="ih-card ih-course-card overflow-hidden flex flex-col">
    <div className="bg-[#dceedd] p-7 min-h-[172px] relative flex flex-col justify-between"><CheckBadgeIcon className="w-9 h-9 text-[#287352]"/><div><span className="text-[10px] uppercase tracking-[.16em] font-bold text-[#598168]">Certificate of completion</span><h3 className="mt-2 font-bold text-xl leading-snug tracking-tight">{cert.course?.title||'Completed course'}</h3></div></div>
    <div className="p-6 flex flex-col flex-1"><p className="text-xs font-semibold text-[#688273]">{cert.course?.category||'Learning'} · {cert.course?.level||'Course'}</p><div className="mt-5 pt-5 border-t border-[#e9eee8] flex items-center gap-2 text-sm text-[#66816d]"><CalendarDaysIcon className="w-4 h-4"/>{cert.issuedAt?new Date(cert.issuedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'Date unavailable'}</div><p className="mt-3 text-xs text-[#86978b] truncate" title={cert.certificateId}>ID: {cert.certificateId}</p><Link href={`/certificates/${encodeURIComponent(cert._id)}`} className="ih-btn ih-btn-primary mt-6 w-full">View credential <ArrowUpRightIcon className="h-5 w-5"/></Link></div>
   </article>)}</div>}
  </div>
 </div>;
}
