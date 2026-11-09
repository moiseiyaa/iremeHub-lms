'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CameraIcon, UserCircleIcon, ShieldCheckIcon, ArrowUpRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { apiGet, apiPut } from '../api/apiClient';

interface Profile {id?:string;_id?:string;name:string;email:string;role:string;avatar?:{url?:string}|string;bio?:string}
const avatarSource=(p:Profile|null)=>{
 const url=typeof p?.avatar==='string'?p.avatar:p?.avatar?.url;
 return url&&/^https:\/\//i.test(url)&&!url.includes('res.cloudinary.com/demo')?url:null;
};
export default function ProfilePage(){
 const router=useRouter();
 const [profile,setProfile]=useState<Profile|null>(null);
 const [form,setForm]=useState({name:'',email:'',bio:''});
 const [loading,setLoading]=useState(true);const [editing,setEditing]=useState(false);
 const [saving,setSaving]=useState(false);const [uploading,setUploading]=useState(false);
 const [error,setError]=useState('');const [success,setSuccess]=useState('');
 useEffect(()=>{let active=true;if(!localStorage.getItem('token')){router.replace('/login?redirect=%2Fprofile');return;}
 (async()=>{const response=await apiGet<Profile>('/auth/me',true);if(!active)return;
  if(response.success&&response.data){setProfile(response.data);setForm({name:response.data.name||'',email:response.data.email||'',bio:response.data.bio||''});}
  else setError(response.error||'Unable to load your profile.');
  setLoading(false);
 })();return()=>{active=false};
 },[router]);
 const save=async(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();setSaving(true);setError('');setSuccess('');
  const result=await apiPut<Profile>('/auth/updatedetails',form,true);
  if(result.success&&result.data){setProfile(result.data);setEditing(false);setSuccess('Your profile has been updated.');}
  else setError(result.error||'Could not save your profile.');
  setSaving(false);
 };
 const upload=async(e:ChangeEvent<HTMLInputElement>)=>{
   const file=e.target.files?.[0];if(!file)return;
   if(!file.type.startsWith('image/')||file.size>5*1024*1024){setError('Choose an image under 5 MB.');return;}
   const token=localStorage.getItem('token');if(!token){router.replace('/login');return;}
   setUploading(true);setError('');setSuccess('');
   try{
     const payload=new FormData();payload.append('avatar',file);
     const response=await fetch('/api/v1/auth/updateavatar',{method:'PUT',headers:{Authorization:`Bearer ${token}`},body:payload});
     const body=await response.json().catch(()=>null);
     if(!response.ok||!body?.data)throw new Error(body?.error||'Could not update your profile image.');
     setProfile(body.data);setSuccess('Your profile picture has been updated.');
   }catch(err){setError(err instanceof Error?err.message:'Image upload failed.');}
   finally{setUploading(false);e.target.value='';}
 };
 const source=avatarSource(profile);
 return <div className="min-h-screen bg-[#f5f7f2]">
 <header className="bg-[#143e31] text-white py-14 lg:py-20"><div className="ih-container"><span className="text-xs font-bold tracking-[.14em] uppercase text-[#b2d2bd]">Account settings</span><h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-[-.05em]">Your personal space.</h1><p className="mt-4 text-[#b9d0c0]">Manage your profile, preferences and account details.</p></div></header>
 <div className="ih-container max-w-[980px] py-12 lg:py-16">
 {loading?<div className="ih-skeleton h-[450px]" aria-label="Loading profile"/>:
 <div className="ih-card overflow-hidden">
  <div className="bg-[#e5f0e6] p-7 sm:p-9 flex items-center gap-5 flex-wrap">
   <div className="w-24 h-24 rounded-full bg-[#b7d9c0] flex items-center justify-center overflow-hidden relative border-4 border-white shrink-0">
    {source?<Image src={source} alt="" fill unoptimized sizes="96px" className="object-cover"/>:<UserCircleIcon className="w-14 h-14 text-[#447d58]"/>}
   </div>
   <div className="flex-1 min-w-[190px]"><h2 className="text-2xl font-bold tracking-tight">{profile?.name||'Learner'}</h2><p className="mt-1 text-sm text-[#688170] break-words">{profile?.email}</p><span className="ih-badge mt-3 capitalize">{profile?.role||'Account'}</span></div>
   <label className={`ih-btn ih-btn-neutral cursor-pointer ${uploading?'opacity-50 pointer-events-none':''}`}><CameraIcon className="w-5 h-5"/>{uploading?'Uploading...':'Change photo'}<input type="file" accept="image/*" className="sr-only" onChange={e=>void upload(e)} disabled={uploading}/></label>
  </div>
  <div className="p-7 sm:p-10">
   {error&&<p role="alert" className="mb-5 border border-red-200 bg-red-50 text-red-700 p-4 text-sm rounded-xl">{error}</p>}
   {success&&<p role="status" className="mb-5 border border-[#b8e2be] bg-[#ecf7ec] text-[#2d744b] p-4 text-sm rounded-xl inline-flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/>{success}</p>}
   {!profile?<div className="ih-empty">We couldn't find your profile. Please sign in again.</div>:<>
   <div className="flex gap-5 flex-wrap items-center justify-between"><div><h3 className="text-xl font-bold">Personal information</h3><p className="text-sm ih-muted mt-2">Keep your details up to date.</p></div><button type="button" onClick={()=>{if(editing)setForm({name:profile.name,email:profile.email,bio:profile.bio||''});setEditing(v=>!v);setError('');setSuccess('')}} className="ih-btn ih-btn-neutral">{editing?'Cancel editing':'Edit profile'}</button></div>
   <form className="grid sm:grid-cols-2 gap-6 mt-8" onSubmit={e=>void save(e)}>
    <div><label className="ih-form-label" htmlFor="profile-name">Full name</label><input id="profile-name" className="ih-input" required minLength={2} maxLength={100} disabled={!editing} value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></div>
    <div><label className="ih-form-label" htmlFor="profile-email">Email address</label><input id="profile-email" className="ih-input" type="email" required disabled={!editing} value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))}/></div>
    <div className="sm:col-span-2"><label className="ih-form-label" htmlFor="profile-bio">About you</label><textarea id="profile-bio" className="ih-input !min-h-[130px]" maxLength={500} disabled={!editing} value={form.bio} placeholder="Add a short introduction..." onChange={e=>setForm(v=>({...v,bio:e.target.value}))}/><p className="mt-2 text-xs ih-muted">{form.bio.length}/500 characters</p></div>
    {editing&&<div className="sm:col-span-2 flex justify-end"><button type="submit" className="ih-btn ih-btn-primary disabled:opacity-50" disabled={saving}>{saving?'Saving...':'Save profile'}<ArrowUpRightIcon className="w-4 h-4"/></button></div>}
   </form></>}
  </div>
 </div>}
 <div className="ih-card p-7 sm:p-9 mt-7 flex flex-wrap justify-between gap-5 items-center"><div className="flex gap-4 items-center"><div className="bg-[#e6f2e6] rounded-2xl p-3"><ShieldCheckIcon className="w-7 h-7 text-[#297a50]"/></div><div><h3 className="font-bold text-lg">Account security</h3><p className="text-sm ih-muted mt-2">Update your password regularly.</p></div></div><Link href="/change-password" className="ih-btn ih-btn-neutral">Change password <ArrowUpRightIcon className="w-4 h-4"/></Link></div>
 </div></div>;
}
