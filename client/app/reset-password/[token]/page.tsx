'use client';

import { useState, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPassword(){
  const token=String(useParams()?.token||'');
  const [password,setPassword]=useState('');const [confirm,setConfirm]=useState('');const [pending,setPending]=useState(false);const [message,setMessage]=useState('');const [done,setDone]=useState(false);
  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();setMessage('');
    if(password.length<8){setMessage('Use at least 8 characters.');return;}
    if(password!==confirm){setMessage('Passwords do not match.');return;}
    if(!token){setMessage('Invalid reset link.');return;}
    setPending(true);
    try {
      const res=await fetch(`/api/v1/auth/resetpassword/${encodeURIComponent(token)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
      const body=await res.json().catch(()=>null);
      if(!res.ok)throw new Error(body?.error||'Unable to reset password.');
      setDone(true);
    }catch(e){setMessage(e instanceof Error?e.message:'Reset failed.');}finally{setPending(false);}
  };
  return <div className="bg-[#f5f7f2] min-h-[70vh] py-16"><div className="ih-container max-w-[570px]"><div className="ih-card p-8 sm:p-11"><span className="ih-eyebrow">Account security</span><h1 className="text-3xl tracking-tight font-bold mt-5">Choose a new password.</h1>{done?<div className="mt-7"><p role="status" className="text-sm leading-7 text-[#476b50]">Your password has been updated.</p><Link href="/login" className="ih-btn ih-btn-primary mt-6">Sign in</Link></div>:<form onSubmit={submit} className="space-y-5 mt-7"><div><label htmlFor="new-pass" className="ih-form-label">New password</label><input id="new-pass" className="ih-input" type="password" minLength={8} autoComplete="new-password" required value={password} onChange={e=>setPassword(e.target.value)}/></div><div><label htmlFor="confirm-pass" className="ih-form-label">Confirm password</label><input id="confirm-pass" className="ih-input" type="password" minLength={8} autoComplete="new-password" required value={confirm} onChange={e=>setConfirm(e.target.value)}/></div>{message&&<p role="alert" className="text-red-700 text-sm rounded-xl p-3 border border-red-200 bg-red-50">{message}</p>}<button disabled={pending} className="ih-btn ih-btn-primary w-full">{pending?'Updating...':'Save new password'}</button></form>}</div></div></div>;
}
