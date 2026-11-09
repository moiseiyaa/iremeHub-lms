'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { UserGroupIcon, MagnifyingGlassIcon, ArrowPathIcon, ShieldCheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { apiGet, apiPut, apiDelete } from '../../../api/apiClient';

type Role = 'admin'|'educator'|'student';
interface Account { _id:string;id?:string;name:string;email:string;role:Role;createdAt?:string }

export default function AdminUsersClient(){
  const router=useRouter();const params=useSearchParams();
  const initial=params?.get('role')||'all';
  const [users,setUsers]=useState<Account[]>([]);
  const [selfId,setSelfId]=useState('');
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState(initial);
  const [working,setWorking]=useState<string|null>(null);
  const [page,setPage]=useState(1);
  const perPage=10;
  const load=async()=>{
    setLoading(true);setError('');
    const [response,me]=await Promise.all([apiGet<Account[]>('/auth/users',true),apiGet<Account>('/auth/me',true)]);
    if(response.success&&Array.isArray(response.data))setUsers(response.data);
    else setError(response.error||'Could not load accounts.');
    if(me.success && me.data)setSelfId(me.data._id || me.data.id || '');
    setLoading(false);
  };
  useEffect(()=>{void load()},[]);
  useEffect(()=>{setFilter(params?.get('role')||'all');setPage(1)},[params]);
  const filtered=useMemo(()=>users.filter(user=>(filter==='all'||user.role===filter)&&[user.name,user.email].join(' ').toLowerCase().includes(query.toLowerCase())),[users,filter,query]);
  const pages=Math.max(1,Math.ceil(filtered.length/perPage));
  const visible=filtered.slice((page-1)*perPage,page*perPage);
  const counts={all:users.length,admin:users.filter(u=>u.role==='admin').length,educator:users.filter(u=>u.role==='educator').length,student:users.filter(u=>u.role==='student').length};
  const updateRole=async(user:Account,role:Role)=>{
    if(role===user.role)return;
    if(user._id===selfId){setError('You cannot change your own administrator role here.');return;}
    setWorking(user._id);setError('');
    const result=await apiPut<Account>(`/auth/users/${encodeURIComponent(user._id)}/role`,{role},true);
    if(result.success)setUsers(prev=>prev.map(item=>item._id===user._id?{...item,role}:item));
    else setError(result.error||'Role update failed.');
    setWorking(null);
  };
  const deleteUser=async(user:Account)=>{
    if(user._id===selfId){setError('You cannot delete your own account here.');return;}
    if(!window.confirm(`Remove account for ${user.name}? This action cannot be undone.`))return;
    setWorking(user._id);setError('');
    const result=await apiDelete(`/auth/users/${encodeURIComponent(user._id)}`,true);
    if(result.success)setUsers(prev=>prev.filter(item=>item._id!==user._id));
    else setError(result.error||'Could not remove the account.');
    setWorking(null);
  };
  return <div className="bg-[#f5f7f2] min-h-screen py-9"><div className="ih-container">
    <div className="flex flex-wrap justify-between items-end gap-6 mb-8"><div><span className="ih-eyebrow">People & access</span><h1 className="mt-4 text-3xl sm:text-4xl tracking-[-.055em] font-extrabold">User management</h1><p className="mt-3 text-[#738677] text-sm">Review registered accounts, roles and access permissions.</p></div><button type="button" onClick={()=>void load()} className="ih-btn ih-btn-neutral"><ArrowPathIcon className="w-5 h-5"/> Refresh accounts</button></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">{(['all','student','educator','admin'] as const).map(key=><button key={key} type="button" onClick={()=>{router.push(key==='all'?'/dashboard/admin/users':`/dashboard/admin/users?role=${key}`);setFilter(key);setPage(1)}} className={`ih-card !text-left px-5 py-5 transition-colors ${filter===key?'!bg-[#e7f3e7] !border-[#8bb69b]':''}`}><p className="text-xs text-[#6f8775] capitalize font-semibold">{key==='all'?'Total users':key+'s'}</p><p className="text-3xl font-extrabold mt-2 tracking-tight">{counts[key]}</p></button>)}</div>
    <div className="ih-card overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-[#e4ece3]"><div><h2 className="font-bold text-lg inline-flex items-center gap-2"><UserGroupIcon className="w-5 h-5 text-[#398b5e]"/> Accounts</h2><p className="text-xs ih-muted mt-1">{filtered.length} accounts matching filters</p></div><div className="relative w-full sm:w-[280px]"><MagnifyingGlassIcon className="w-5 h-5 absolute top-1/2 left-3 -translate-y-1/2 text-[#70917a]"/><input type="search" aria-label="Search users" className="ih-input !pl-10" placeholder="Search name or email..." value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}}/></div></div>
      {error&&<p role="alert" className="mx-6 mt-5 text-sm text-red-700 bg-red-50 border border-red-200 p-4 rounded-xl">{error}</p>}
      {loading?<div className="p-7 space-y-4">{[1,2,3,4].map(i=><div key={i} className="ih-skeleton h-12"/>)}</div>:visible.length===0?<div className="ih-empty !border-0"><ShieldCheckIcon className="w-10 h-10 text-[#4f9367]"/><h3 className="text-lg font-bold mt-4">No users to display</h3><p className="text-sm ih-muted mt-2">Change the search or filter to see other accounts.</p></div>:<div className="overflow-x-auto"><table className="w-full text-left min-w-[750px]"><thead className="bg-[#f2f7ef]"><tr>{['Name','Role','Joined','Actions'].map(h=><th key={h} className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-[#677c6c]">{h}</th>)}</tr></thead><tbody className="divide-y divide-[#e9efe9]">{visible.map(user=><tr key={user._id} className="hover:bg-[#fbfdf9]"><td className="px-6 py-5"><p className="font-semibold text-sm">{user.name}{user._id===selfId?' (you)':''}</p><p className="text-xs text-[#718678] mt-1">{user.email}</p></td><td className="px-6 py-5"><label className="sr-only" htmlFor={`role-${user._id}`}>Role for {user.name}</label><select id={`role-${user._id}`} className="ih-input !w-[145px] !min-h-[38px] capitalize !text-xs" value={user.role} disabled={working===user._id||user._id===selfId} onChange={e=>void updateRole(user,e.target.value as Role)}><option value="student">Student</option><option value="educator">Educator</option><option value="admin">Admin</option></select></td><td className="px-6 py-5 text-xs text-[#7d9081]">{user.createdAt?new Date(user.createdAt).toLocaleDateString():'—'}</td><td className="px-6 py-5"><button type="button" disabled={working===user._id||user._id===selfId} onClick={()=>void deleteUser(user)} className="inline-flex items-center gap-1 text-red-700 hover:underline text-xs font-semibold disabled:opacity-30"><TrashIcon className="w-4 h-4"/> Delete</button></td></tr>)}</tbody></table></div>}
      <div className="flex items-center justify-between gap-4 border-t border-[#e5ece4] px-6 py-4"><span className="text-xs ih-muted">Page {page} of {pages}</span><div className="flex gap-2"><button type="button" className="ih-btn ih-btn-neutral !min-h-[34px] !p-2 !text-xs" disabled={page<=1} onClick={()=>setPage(x=>Math.max(1,x-1))}>Previous</button><button type="button" className="ih-btn ih-btn-neutral !min-h-[34px] !p-2 !text-xs" disabled={page>=pages} onClick={()=>setPage(x=>Math.min(pages,x+1))}>Next</button></div></div>
    </div><p className="text-xs ih-muted mt-5">Invitation and provisioning workflows will be introduced with institutional membership management.</p>
  </div></div>;
}
