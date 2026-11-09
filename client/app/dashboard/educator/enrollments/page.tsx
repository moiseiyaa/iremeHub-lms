'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { UserGroupIcon, MagnifyingGlassIcon, ArrowUpRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { apiGet } from '../../../api/apiClient';

interface Enrollment {
 _id:string;user?:{_id:string;name:string;email:string};course?:{_id:string;title:string};
 status?:string;progress?:number;lastActive?:string;enrolledAt?:string
}
export default function EnrollmentsPage(){
 const [records,setRecords]=useState<Enrollment[]>([]);
 const [loading,setLoading]=useState(true);const [error,setError]=useState('');
 const [search,setSearch]=useState('');const [course,setCourse]=useState('all');const [status,setStatus]=useState('all');
 const [refresh,setRefresh]=useState(0);
 useEffect(()=>{let live=true;(async()=>{setLoading(true);setError('');
  const result=await apiGet<Enrollment[]>('/educator/enrollments',true);
  if(!live)return;if(result.success&&Array.isArray(result.data))setRecords(result.data);
  else setError(result.error||'Could not load enrollments.');
  setLoading(false);
 })();return()=>{live=false}},[refresh]);
 const courses=useMemo(()=>[...new Map(records.filter(r=>r.course?._id).map(r=>[r.course!._id,r.course!])).values()], [records]);
 const filtered=useMemo(()=>records.filter(r=>(course==='all'||r.course?._id===course)&&(status==='all'||r.status===status)&&[r.user?.name||'',r.user?.email||'',r.course?.title||''].join(' ').toLowerCase().includes(search.toLowerCase())),[records,search,course,status]);
 return <div className="bg-[#f5f7f2] min-h-screen py-10"><div className="ih-container">
  <div className="flex flex-wrap gap-5 justify-between items-end mb-9"><div><span className="ih-eyebrow">Enrollment insights</span><h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-[-.05em]">Course enrollments.</h1><p className="mt-3 text-sm ih-muted">Follow learners across courses you teach. Enrollment approvals are managed separately.</p></div><Link href="/dashboard/educator/requests" className="ih-btn ih-btn-primary">Review requests <ArrowUpRightIcon className="w-5 h-5"/></Link></div>
  <div className="grid md:grid-cols-3 gap-4 mb-8">{[{label:'Enrolled records',value:records.length},{label:'Active courses',value:courses.length},{label:'Completed progress',value:records.filter(r=>(r.progress||0)>=100).length}].map(c=><div key={c.label} className="ih-card p-6"><p className="text-sm ih-muted">{c.label}</p><p className="text-3xl font-extrabold mt-2">{c.value}</p></div>)}</div>
  <section className="ih-card overflow-hidden"><div className="flex flex-wrap gap-3 items-center justify-between p-6 border-b border-[#e8eee5]"><div><h2 className="text-lg font-bold inline-flex gap-2 items-center"><UserGroupIcon className="w-5 h-5 text-[#4e9268]"/>Enrollment register</h2><p className="text-xs ih-muted mt-2">{filtered.length} matching records</p></div><div className="flex flex-wrap gap-3"><div className="relative"><MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#789083]"/><input type="search" className="ih-input !pl-9 !min-h-10" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a learner" aria-label="Search enrollments"/></div><select className="ih-input !min-h-10 !w-[180px]" aria-label="Filter course" value={course} onChange={e=>setCourse(e.target.value)}><option value="all">All courses</option>{courses.map(c=><option key={c._id} value={c._id}>{c.title}</option>)}</select><button type="button" className="ih-btn ih-btn-neutral !min-h-10 !py-2" onClick={()=>setRefresh(i=>i+1)}><ArrowPathIcon className="w-4 h-4"/>Refresh</button></div></div>
  {error&&<p role="alert" className="p-4 rounded-xl mx-6 mt-5 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</p>}
  {loading?<div className="p-7 space-y-4">{[1,2,3].map(i=><div key={i} className="ih-skeleton h-16"/>)}</div>:filtered.length===0?<div className="ih-empty !border-0"><UserGroupIcon className="h-10 w-10 text-[#4e9068]"/><h3 className="mt-5 font-bold text-xl">No enrollments to show</h3><p className="text-sm ih-muted mt-2">Records appear here when learners join your courses.</p></div>:<div className="overflow-x-auto"><table className="w-full min-w-[740px] text-left"><thead><tr>{['Learner','Course','Progress','Last activity','Details'].map(h=><th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#64816c]">{h}</th>)}</tr></thead><tbody className="divide-y divide-[#e9efe7]">{filtered.map(r=><tr key={r._id}><td className="px-6 py-5"><p className="text-sm font-bold">{r.user?.name||'Learner'}</p><p className="text-xs ih-muted mt-1">{r.user?.email}</p></td><td className="px-6 py-5 text-sm">{r.course?.title||'Course'}</td><td className="px-6 py-5"><div className="w-28"><div className="text-xs text-[#62816b] mb-2">{Math.round(Math.max(0,Math.min(100,r.progress||0)))}%</div><div className="h-1.5 bg-[#e5eee4] rounded-full overflow-hidden"><div className="h-full bg-[#4a9665]" style={{width:`${Math.max(0,Math.min(100,r.progress||0))}%`}}/></div></div></td><td className="px-6 py-5 text-xs ih-muted">{r.lastActive?new Date(r.lastActive).toLocaleDateString('en-GB'):'—'}</td><td className="px-6 py-5"><Link href={r.user?._id?`/dashboard/educator/students/${r.user._id}`:'/dashboard/educator/students'} className="text-xs font-bold text-[#2b7950]">View learner</Link></td></tr>)}</tbody></table></div>}
  </section>
 </div></div>;
}
