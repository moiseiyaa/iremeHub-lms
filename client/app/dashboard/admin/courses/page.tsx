'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AcademicCapIcon, MagnifyingGlassIcon, ArrowUpRightIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { apiGet, apiDelete } from '../../../api/apiClient';

interface Course { _id:string;title:string;category?:string;level?:string;price?:number;isPublished:boolean;createdAt?:string;instructor?:{name?:string;email?:string} }
type Filter = 'all'|'published'|'draft';
export default function AdminCoursesPage(){
  const [courses,setCourses]=useState<Course[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [status,setStatus]=useState<Filter>('all');
  const [search,setSearch]=useState('');
  const [working,setWorking]=useState<string|null>(null);
  const load=async()=>{
    setLoading(true);setError('');
    const result=await apiGet<Course[]>('/admin/courses?limit=50',true);
    if(result.success&&Array.isArray(result.data))setCourses(result.data);
    else setError(result.error||'Unable to load courses.');
    setLoading(false);
  };
  useEffect(()=>{void load()},[]);
  const visible=useMemo(()=>courses.filter(c=>(status==='all'||(status==='published' ? c.isPublished : !c.isPublished))&&[c.title,c.category||'',c.instructor?.name||''].join(' ').toLowerCase().includes(search.toLowerCase())),[courses,status,search]);
  const remove=async(course:Course)=>{
    if(!confirm(`Permanently delete "${course.title}"? This cannot be undone.`))return;
    setWorking(course._id);setError('');
    const result=await apiDelete(`/courses/${course._id}`,true);
    if(result.success)setCourses(prev=>prev.filter(c=>c._id!==course._id));
    else setError(result.error||'Unable to delete course.');
    setWorking(null);
  };
  return <div className="bg-[#f5f7f2] min-h-screen py-9"><div className="ih-container">
    <div className="flex flex-wrap justify-between gap-5 items-end mb-8"><div><span className="ih-eyebrow">Content & learning</span><h1 className="text-3xl sm:text-4xl font-bold tracking-[-.05em] mt-4">All courses</h1><p className="text-sm ih-muted mt-3">Review published programs and course drafts across educators.</p></div><Link href="/dashboard/educator/courses/create" className="ih-btn ih-btn-primary">New course <ArrowUpRightIcon className="h-5 w-5"/></Link></div>
    <div className="grid md:grid-cols-3 gap-4 mb-8">{[{label:'Total courses',count:courses.length},{label:'Published',count:courses.filter(c=>c.isPublished).length},{label:'Drafts',count:courses.filter(c=>!c.isPublished).length}].map(item=><div key={item.label} className="ih-card p-6"><p className="text-sm ih-muted">{item.label}</p><p className="text-3xl font-extrabold mt-2">{item.count}</p></div>)}</div>
    <section className="ih-card overflow-hidden"><div className="p-6 flex flex-wrap gap-4 justify-between items-center border-b border-[#e1eae1]"><h2 className="font-bold text-lg">Course library</h2><div className="flex flex-wrap gap-3"><div className="relative"><MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#668872]"/><input className="ih-input !pl-10 !min-h-10" value={search} onChange={e=>setSearch(e.target.value)} type="search" placeholder="Search courses" aria-label="Search courses"/></div><select value={status} onChange={e=>setStatus(e.target.value as Filter)} className="ih-input !min-h-10 !w-[150px]" aria-label="Filter by status"><option value="all">All courses</option><option value="published">Published</option><option value="draft">Drafts</option></select></div></div>
      {error&&<div role="alert" className="m-6 p-4 border border-red-200 bg-red-50 text-red-700 text-sm rounded-xl">{error}</div>}
      {loading?<div className="p-7 space-y-3">{[1,2,3,4].map(i=><div key={i} className="ih-skeleton h-14"/>)}</div>:visible.length===0?<div className="ih-empty !border-0"><AcademicCapIcon className="w-10 h-10 text-[#4d9b6c]"/><h3 className="font-bold text-lg mt-4">No courses found</h3><p className="mt-2 text-sm ih-muted">When courses are created, they will appear here.</p></div>:<div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#f0f6ef]"><tr>{['Course','Educator','Visibility','Created','Actions'].map(h=><th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-[.09em] text-[#647b6b]">{h}</th>)}</tr></thead><tbody className="divide-y divide-[#e9f0e7]">{visible.map(c=><tr key={c._id} className="hover:bg-[#fcfdf9]"><td className="px-6 py-5"><p className="font-bold text-sm">{c.title}</p><p className="text-xs ih-muted mt-1">{c.category || 'Course'} · {c.level||'All levels'}</p></td><td className="px-6 py-5 text-sm">{c.instructor?.name||'—'}</td><td className="px-6 py-5"><span className={`rounded-full px-3 py-1 text-xs font-bold ${c.isPublished?'bg-[#e2f2e2] text-[#24694a]':'bg-[#f5efdf] text-[#816f46]'}`}>{c.isPublished?'Published':'Draft'}</span></td><td className="px-6 py-5 text-xs ih-muted">{c.createdAt?new Date(c.createdAt).toLocaleDateString():'—'}</td><td className="px-6 py-5"><div className="flex gap-3 items-center"><Link href={`/dashboard/educator/courses/${c._id}/edit`} className="inline-flex gap-1 items-center text-xs font-bold text-[#227452]"><PencilSquareIcon className="w-4 h-4"/>Edit</Link>{c.isPublished&&<Link href={`/courses/${c._id}`} className="text-xs text-[#327d57] font-semibold">View</Link>}<button type="button" disabled={working===c._id} onClick={()=>void remove(c)} className="text-red-700 text-xs font-semibold inline-flex gap-1 items-center disabled:opacity-50"><TrashIcon className="w-4 h-4"/>Delete</button></div></td></tr>)}</tbody></table></div>}
    </section><p className="mt-5 text-xs ih-muted">Showing the 50 most recent courses. Institutional pagination and organization filters are scheduled for the multi-tenant backend.</p>
  </div></div>;
}
