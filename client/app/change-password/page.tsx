'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ChangePasswordPage(){
 const router=useRouter();
 const [form,setForm]=useState({currentPassword:'',newPassword:'',confirmPassword:''});
 const [loading,setLoading]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
 useEffect(()=>{if(!window.localStorage.getItem('token'))router.replace('/login?redirect=%2Fchange-password')},[router]);
 const submit=async(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();setError('');setSuccess('');
  if(form.newPassword!==form.confirmPassword){setError('Your new passwords do not match.');return;}
  if(form.newPassword.length<8){setError('Use a password at least eight characters long.');return;}
  if(form.newPassword===form.currentPassword){setError('Choose a new password different from your current password.');return;}
  const token=localStorage.getItem('token');if(!token){router.replace('/login');return;}
  setLoading(true);
  try{
   const response=await fetch('/api/v1/auth/updatepassword',{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({currentPassword:form.currentPassword,newPassword:form.newPassword})});
   const body=await response.json().catch(()=>null);
   if(!response.ok||!body?.success)throw new Error(body?.error||'Unable to change password.');
   if(body.token)localStorage.setItem('token',body.token);
   setForm({currentPassword:'',newPassword:'',confirmPassword:''});
   setSuccess('Your password was updated successfully.');
  }catch(err){setError(err instanceof Error?err.message:'Unable to change password.');}
  finally{setLoading(false);}
 };
 return <div className="min-h-[75vh] bg-[#f5f7f2] py-12 lg:py-20"><div className="ih-container max-w-[620px]">
  <Link href="/profile" className="text-[#28764f] text-sm font-semibold inline-flex items-center gap-2"><ArrowLeftIcon className="w-4 h-4"/> Back to profile</Link>
  <div className="ih-card p-7 sm:p-11 mt-7"><span className="ih-eyebrow">Account security</span><div className="mt-6 rounded-2xl bg-[#e5f2e7] inline-flex p-3"><LockClosedIcon className="w-8 h-8 text-[#267c53]"/></div><h1 className="mt-5 text-3xl font-bold tracking-[-.05em]">Change your password.</h1><p className="text-sm ih-muted leading-7 mt-4">Use a strong password that you don't use on other websites.</p>
  <form className="mt-8 space-y-5" onSubmit={e=>void submit(e)}>
   <div><label className="ih-form-label" htmlFor="current-password">Current password</label><input className="ih-input" id="current-password" type="password" autoComplete="current-password" required value={form.currentPassword} onChange={e=>setForm(v=>({...v,currentPassword:e.target.value}))}/></div>
   <div><label className="ih-form-label" htmlFor="new-password">New password</label><input className="ih-input" id="new-password" type="password" autoComplete="new-password" minLength={8} required value={form.newPassword} onChange={e=>setForm(v=>({...v,newPassword:e.target.value}))}/></div>
   <div><label className="ih-form-label" htmlFor="confirm-password">Confirm new password</label><input className="ih-input" id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={form.confirmPassword} onChange={e=>setForm(v=>({...v,confirmPassword:e.target.value}))}/></div>
   {error&&<p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">{error}</p>}
   {success&&<p role="status" className="text-sm text-[#277a4f] bg-[#e8f4e9] border border-[#b7d8bf] rounded-xl p-4 inline-flex gap-2 items-center"><CheckCircleIcon className="w-5 h-5"/>{success}</p>}
   <button type="submit" className="ih-btn ih-btn-primary w-full disabled:opacity-50" disabled={loading}>{loading?'Updating...':'Update password'}</button>
  </form>
  </div></div></div>;
}
