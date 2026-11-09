'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from './AuthProvider';

type Mode = 'login' | 'register';
interface Props { initialMode?: Mode; onSuccess?: () => void; }

export default function AuthForm({ initialMode='login', onSuccess }: Props) {
  const router = useRouter();
  const {checkAuth} = useAuth();
  const [mode,setMode] = useState<Mode>(initialMode);
  useEffect(()=>{setMode(initialMode);setError('');},[initialMode]);
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [confirm,setConfirm] = useState('');
  const [visible,setVisible] = useState(false);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');

  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault(); setError('');
    if(mode==='register' && password!==confirm){setError('Passwords do not match.');return;}
    if(mode==='register' && password.length<8){setError('Use a password with at least eight characters.');return;}
    setLoading(true);
    try {
      const res=await fetch(mode==='login'?'/api/v1/auth/login':'/api/v1/auth/register',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify(mode==='login'?{email,password}:{name,email,password})
      });
      const payload=await res.json().catch(()=>null);
      if(!res.ok||!payload?.token)throw new Error(payload?.error||'Unable to authenticate. Please check your details.');
      window.localStorage.setItem('token',payload.token);
      await checkAuth();
      onSuccess?.();
      const next=new URLSearchParams(window.location.search).get('redirect');
      const safeNext=next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : '/dashboard';
      router.push(safeNext);
      router.refresh();
    }catch(e){setError(e instanceof Error?e.message:'Unable to sign in at this time.');}
    finally{setLoading(false);}
  };
  const swap=(next:Mode)=>{setMode(next);setError('');setPassword('');setConfirm('');};
  return <div>
    <div className="mb-8"><p className="ih-eyebrow">{mode==='login'?'Welcome back':'Start learning'}</p><h1 className="text-3xl sm:text-4xl font-bold tracking-[-.055em] mt-4">{mode==='login'?'Sign in to your space.':'Create your account.'}</h1><p className="text-sm leading-7 text-[#788a7d] mt-3">{mode==='login'?'Pick up your learning journey right where you left off.':'Build your learning journey with iremehub+.'}</p></div>
    <form className="space-y-5" onSubmit={submit}>
      {mode==='register'&&<div><label htmlFor="ih-auth-name" className="ih-form-label">Full name</label><input id="ih-auth-name" className="ih-input" required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"/></div>}
      <div><label htmlFor="ih-auth-email" className="ih-form-label">Email address</label><input id="ih-auth-email" className="ih-input" required type="email" autoComplete="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></div>
      <div><div className="flex justify-between items-center gap-2"><label htmlFor="ih-auth-password" className="ih-form-label">Password</label>{mode==='login'&&<Link href="/forgot-password" className="text-xs font-semibold text-[#347b57] hover:underline mb-2">Forgot password?</Link>}</div><div className="relative"><input id="ih-auth-password" className="ih-input !pr-12" required minLength={mode==='register'?8:1} type={visible?'text':'password'} autoComplete={mode==='login'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/><button type="button" onClick={()=>setVisible(v=>!v)} aria-label={visible?'Hide password':'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718879] p-1">{visible?<EyeSlashIcon className="w-5 h-5"/>:<EyeIcon className="w-5 h-5"/>}</button></div></div>
      {mode==='register'&&<div><label htmlFor="ih-auth-confirm" className="ih-form-label">Confirm password</label><input id="ih-auth-confirm" className="ih-input" required minLength={8} type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat your password"/></div>}
      {error&&<p role="alert" className="rounded-xl border border-[#f5d1c9] bg-[#fff4f1] px-4 py-3 text-sm text-[#9b3a32]">{error}</p>}
      <button type="submit" disabled={loading} className="ih-btn ih-btn-primary w-full disabled:opacity-50">{loading?'Please wait...':mode==='login'?'Sign in':'Create account'}<ArrowUpRightIcon className="w-5 h-5"/></button>
    </form>
    <div className="mt-8 pt-6 border-t border-[#e2e9e2] text-center text-sm text-[#6e8575]">{mode==='login'?'New to iremehub+?':'Already have an account?'}{' '}<button type="button" onClick={()=>swap(mode==='login'?'register':'login')} className="text-[#19654e] font-bold hover:underline">{mode==='login'?'Create an account':'Sign in'}</button></div>
    <p className="text-xs text-[#91a195] text-center mt-5">Your personal information should stay private and secure.</p>
  </div>;
}
