'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ForgotPassword(){
  const [email,setEmail]=useState('');const [loading,setLoading]=useState(false);const [error,setError]=useState('');const [success,setSuccess]=useState(false);
  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();setLoading(true);setError('');setSuccess(false);
    try{const res=await fetch('/api/v1/auth/forgotpassword',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});const body=await res.json().catch(()=>null);if(!res.ok)throw new Error(body?.error||'Password recovery is not currently available.');setSuccess(true);}
    catch(e){setError(e instanceof Error?e.message:'Unable to request a reset link.');}finally{setLoading(false);}
  };
  return <div className="min-h-[70vh] bg-[#f5f7f2] py-16"><div className="ih-container max-w-[570px]"><div className="ih-card p-8 sm:p-11"><span className="ih-eyebrow">Account help</span><h1 className="text-3xl font-bold tracking-tight mt-5">Reset your password.</h1><p className="ih-muted text-sm leading-7 mt-4">Enter your account email address. Recovery email delivery is being upgraded and may be temporarily unavailable.</p>
    {success?<p role="status" className="mt-7 rounded-xl p-4 bg-[#e5f3e6] text-sm text-[#235b3b]">If your account is eligible, follow the instructions sent to your inbox.</p>:<form onSubmit={submit} className="mt-7 space-y-5"><div><label htmlFor="forgot-email" className="ih-form-label">Email address</label><input className="ih-input" id="forgot-email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></div>{error&&<p role="alert" className="rounded-xl bg-red-50 border border-red-200 text-red-700 p-3 text-sm">{error}</p>}<button type="submit" disabled={loading} className="ih-btn ih-btn-primary w-full disabled:opacity-50">{loading?'Submitting...':'Request reset link'}</button></form>}
    <Link href="/login" className="mt-8 text-sm text-[#2f7651] font-semibold inline-flex items-center gap-2"><ArrowLeftIcon className="w-4 h-4"/> Back to sign in</Link></div></div></div>;
}
