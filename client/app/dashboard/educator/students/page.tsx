'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { UserGroupIcon, MagnifyingGlassIcon, ArrowUpRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { apiGet } from '../../../api/apiClient';

interface Student {_id:string;name:string;email:string;memberSince?:string;profileImage?:{url?:string}}
export default function StudentsManagement(){
 const [students,setStudents]=useState<Student[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [query,setQuery]=useState('');
 const [page,setPage]=useState(1);
 const [refresh,setRefresh]=useState(0);
 useEffect(()=>{let live=true;(async()=>{
  setLoading(true);setError('');
  const result=await apiGet<Student[]>('/educator/students',true);
  if(!live)return;
  if(result.success&&Array.isArray(result.data))setStudents(result.data);
  else setError(result.error||'We could not load your learners.');
  setLoading(false);
 })();return()=>{live=false}},[refresh]);
 const filtered=useMemo(()=>students.filter(s=>[s.name,s.email].join(' ').toLowerCase().includes(query.toLowerCase())),[students,query]);
 const pageSize=12;const pages=Math.max(1,Math.ceil(filtered.length/pageSize));
 const visible=filtered.slice((page-1)*pageSize,page*pageSize);
 return <div className="min-h-screen bg-[#f5f7f2] py-10"><div className="ih-container">
  <div className="flex flex-wrap gap-5 justify-between items-end mb-9"><div><span className="ih-eyebrow">Your teaching community</span><h1 className="text-3xl sm:text-4xl font-bold tracking-[-.055em] mt-4">Your learners.</h1><p className="text-sm ih-muted mt-3">Students enrolled in courses you manage.</p></div><button type="button" onClick={()=>setRefresh(i=>i+1)} className="ih-btn ih-btn-neutral"><ArrowPathIcon className="w-5 h-5"/>Refresh list</button></div>
  <div className="ih-card overflow-hidden">
   <div className="flex flex-wrap justify-between gap-5 items-center p-6 border-b border-[#e5ece4]"><div><h2 className="font-bold text-lg inline-flex gap-2 items-center"><UserGroupIcon className="w-5 h-5 text-[#3f8760]"/>Learner directory</h2><p className="text-xs ih-muted mt-2">{filtered.length} matching learners</p></div><div className="relative w-full sm:w-[300px]"><MagnifyingGlassIcon className="w-5 h-5 text-[#849787] absolute left-3 top-1/2 -translate-y-1/2"/><input type="search" className="ih-input !pl-10" aria-label="Search learners" placeholder="Name or email..." value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}}/></div></div>
   {error&&<p role="alert" className="mx-6 mt-5 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">{error}</p>}
   {loading?<div className="p-7 space-y-3">{[0,1,2,3].map(i=><div key={i} className="ih-skeleton h-14"/>)}</div>:visible.length===0?<div className="ih-empty !border-0"><UserGroupIcon className="h-11 w-11 text-[#5b936f]"/><h3 className="mt-5 font-bold text-xl">No learners found</h3><p className="text-sm ih-muted mt-2">{error?'Please retry your request.':'Enrolled learners appear here after joining one of your courses.'}</p></div>:<div className="overflow-x-auto"><table className="min-w-[630px] w-full text-left"><thead><tr>{['Learner','Email','Joined','Details'].map(t=><th key={t} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#617a68]">{t}</th>)}</tr></thead><tbody className="divide-y divide-[#e8eee6]">{visible.map(s=><tr key={s._id}><td className="px-6 py-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#e4f1e4] grid place-items-center font-bold text-[#36764e]">{(s.name||'L').slice(0,1).toUpperCase()}</div><span className="text-sm font-bold">{s.name}</span></div></td><td className="px-6 py-5 text-sm text-[#647c6b]">{s.email}</td><td className="px-6 py-5 text-xs ih-muted">{s.memberSince?new Date(s.memberSince).toLocaleDateString('en-GB'):'—'}</td><td className="px-6 py-5"><Link className="text-sm font-bold text-[#2f7852] inline-flex items-center gap-1" href={`/dashboard/educator/students/${s._id}`}>View <ArrowUpRightIcon className="w-4 h-4"/></Link></td></tr>)}</tbody></table></div>}
   <div className="px-6 py-4 border-t border-[#e7eee6] flex justify-between items-center text-xs ih-muted"><span>Page {page} of {pages}</span><div className="flex gap-2"><button type="button" className="ih-btn ih-btn-neutral !text-xs !py-1 !px-3 !min-h-9" disabled={page<=1} onClick={()=>setPage(n=>n-1)}>Previous</button><button type="button" className="ih-btn ih-btn-neutral !text-xs !py-1 !px-3 !min-h-9" disabled={page>=pages} onClick={()=>setPage(n=>n+1)}>Next</button></div></div>
  </div>
 </div></div>;
}
