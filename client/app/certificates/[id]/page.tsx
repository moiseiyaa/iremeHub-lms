'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowDownTrayIcon, CheckBadgeIcon, ShieldCheckIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { apiGet } from '../../api/apiClient';
interface Credential {
 _id:string;certificateId:string;issuedAt:string;user?:{name:string};course?:{title:string;category?:string;description?:string};metadata?:{grade?:string;hoursCompleted?:number;courseCompletionDate?:string}
}
export default function CertificateDetailPage(){
 const router=useRouter();const params=useParams();const id=String(params?.id??'');
 const [cert,setCert]=useState<Credential|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
 const [verification,setVerification]=useState('');const [verifying,setVerifying]=useState(false);
 const [downloading,setDownloading]=useState(false);
 useEffect(()=>{if(!id)return;let active=true;
   if(!localStorage.getItem('token')){router.replace('/login?redirect=%2Fcertificates');return;}
   (async()=>{const result=await apiGet<Credential>(`/certificates/${encodeURIComponent(id)}`,true);if(!active)return;if(result.success&&result.data)setCert(result.data);else setError(result.error||'Certificate not found.');setLoading(false)})();
   return()=>{active=false};
 },[id,router]);
 const verify=async()=>{if(!cert)return;setVerifying(true);setVerification('');
   try{const res=await fetch('/api/v1/certificates/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({certificateId:cert.certificateId})});
    const body=await res.json().catch(()=>null);if(!res.ok||!body?.success)throw new Error(body?.error||'Verification unavailable.');
    setVerification(body.isValid===true?'Verified: the credential is recognized.':'Verification unsuccessful: this credential was not recognized.');
   }catch(err){setVerification(err instanceof Error?err.message:'Could not verify this credential.');}finally{setVerifying(false);}
 };
 const download=async()=>{if(!cert)return;setDownloading(true);setError('');
   try{const token=localStorage.getItem('token');if(!token)throw new Error('Sign in to download your certificate.');
    const res=await fetch(`/api/v1/certificates/${encodeURIComponent(id)}/download`,{headers:{Authorization:`Bearer ${token}`}});
    if(!res.ok||!res.headers.get('content-type')?.includes('application/pdf'))throw new Error('The certificate PDF could not be generated.');
    const blob=await res.blob();const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`iremehub-certificate-${cert.certificateId.replace(/[^a-zA-Z0-9-]/g,'')}.pdf`;document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
   }catch(err){setError(err instanceof Error?err.message:'Download failed.');}finally{setDownloading(false);}
 };
 return <div className="min-h-[75vh] bg-[#f5f7f2] py-12 lg:py-20"><div className="ih-container max-w-[970px]">
  <Link href="/certificates" className="inline-flex items-center gap-2 text-sm font-bold text-[#277a53]"><ArrowLeftIcon className="w-5 h-5"/> All certificates</Link>
  {loading?<div className="ih-skeleton h-[530px] mt-8" aria-label="Loading certificate"/>:!cert?<div className="ih-empty mt-9"><CheckBadgeIcon className="h-10 w-10 text-[#508963]"/><h1 className="font-bold text-xl mt-4">Certificate unavailable</h1><p className="text-sm ih-muted mt-2">{error}</p></div>:<>
   <div className="mt-10 mb-7 flex flex-wrap items-end justify-between gap-4"><div><span className="ih-eyebrow">Achievement details</span><h1 className="text-3xl sm:text-4xl font-bold tracking-[-.05em] mt-4">Your credential.</h1></div><button className="ih-btn ih-btn-primary disabled:opacity-50" onClick={()=>void download()} type="button" disabled={downloading}><ArrowDownTrayIcon className="w-5 h-5"/>{downloading?'Preparing PDF...':'Download certificate'}</button></div>
   {error&&<p role="alert" className="p-4 mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</p>}
   <div className="ih-card p-4 sm:p-8"><div className="border-2 rounded-2xl border-[#b8d6bc] bg-[#fafcf7] min-h-[445px] p-8 sm:p-14 text-center flex flex-col items-center justify-center">
    <span className="inline-flex w-16 h-16 rounded-2xl bg-[#dbedda] items-center justify-center"><CheckBadgeIcon className="w-10 h-10 text-[#357f57]"/></span>
    <p className="mt-6 text-xl font-extrabold tracking-[-.075em] text-[#1b6148]">iremehub<span className="text-[#5d9a71]">+</span></p>
    <p className="mt-8 uppercase tracking-[.2em] text-xs font-bold text-[#6a8a71]">Certificate of completion</p>
    <p className="mt-5 text-sm text-[#657f6d]">Presented to</p><h2 className="mt-2 text-3xl sm:text-4xl tracking-[-.04em] font-bold">{cert.user?.name||'Learner'}</h2>
    <p className="mt-5 text-sm text-[#657f6d]">For successfully completing</p><h3 className="mt-3 text-2xl font-bold text-[#287350] max-w-2xl">{cert.course?.title||'Learning course'}</h3>
    <p className="mt-7 text-xs text-[#7b8c7f]">Issued {new Date(cert.issuedAt).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>
    <p className="mt-3 text-[11px] text-[#809583]">Credential ID: {cert.certificateId}</p>
   </div></div>
   <div className="ih-card p-7 mt-6 flex flex-wrap items-center justify-between gap-5">
    <div><h2 className="font-bold inline-flex gap-2 items-center"><ShieldCheckIcon className="w-5 h-5 text-[#308354]"/> Verify this credential</h2><p className="text-sm ih-muted mt-2">Check its authenticity against the certificate records.</p></div>
    <button type="button" disabled={verifying} onClick={()=>void verify()} className="ih-btn ih-btn-neutral disabled:opacity-50">{verifying?'Verifying...':'Verify now'}</button>
    {verification&&<p role="status" className="w-full text-sm text-[#286b4b]">{verification}</p>}
   </div>
  </>}
 </div></div>;
}
