'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AcademicCapIcon, PlusIcon, MagnifyingGlassIcon, PencilSquareIcon, TrashIcon, ArrowUpRightIcon, ArrowPathIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { apiDelete, apiGet } from '../../../api/apiClient';

interface Course {
 _id:string;title:string;description?:string;category?:string;level?:string;price?:number;
 isPublished?:boolean;thumbnail?:{url?:string};enrolledStudents?:string[];
 studentsCount?:number;createdAt?:string
}
const validArt=(src?:string)=>Boolean(src&&/^https:\/\//.test(src)&&!src.includes('res.cloudinary.com/demo'));

export default function EducatorCourses(){
 const [courses,setCourses]=useState<Course[]>([]);
 const [loading,setLoading]=useState(true);const [error,setError]=useState('');
 const [search,setSearch]=useState('');const [status,setStatus]=useState('all');
 const [refresh,setRefresh]=useState(0);const [deleting,setDeleting]=useState<string|null>(null);
 useEffect(()=>{
   let mounted=true;
   (async()=>{
    setLoading(true);setError('');
    const result=await apiGet<Course[]>('/educator/courses',true);
    if(!mounted)return;
    if(result.success&&Array.isArray(result.data))setCourses(result.data);
    else setError(result.error||'Your courses could not be loaded.');
    setLoading(false);
   })();
   return()=>{mounted=false;};
 },[refresh]);
 const filtered=useMemo(()=>courses.filter(c=>{
   const title=(c.title+' '+(c.description||'')+' '+(c.category||'')).toLowerCase();
   return title.includes(search.trim().toLowerCase()) &&
   (status==='all'||(status==='published'?Boolean(c.isPublished):!c.isPublished));
 }),[courses,search,status]);
 const remove=async(course:Course)=>{
   if(!window.confirm(`Delete "${course.title}" permanently? This action cannot be undone.`))return;
   setDeleting(course._id);setError('');
   const result=await apiDelete(`/courses/${encodeURIComponent(course._id)}`,true);
   if(result.success)setCourses(list=>list.filter(c=>c._id!==course._id));
   else setError(result.error||'Unable to delete this course.');
   setDeleting(null);
 };
 return <div className="min-h-screen bg-[#f5f7f2] py-9 lg:py-12"><div className="ih-container">
  <div className="flex flex-wrap items-end justify-between gap-6 mb-9"><div><span className="ih-eyebrow">Educator workspace</span><h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-[-.055em]">Your courses.</h1><p className="mt-3 text-sm ih-muted">Build, refine and publish thoughtful learning experiences.</p></div><Link href="/dashboard/educator/courses/create" className="ih-btn ih-btn-primary"><PlusIcon className="h-5 w-5"/> Create course</Link></div>
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">{[{label:'All courses',value:courses.length},{label:'Published',value:courses.filter(c=>c.isPublished).length},{label:'In draft',value:courses.filter(c=>!c.isPublished).length}].map(item=><div className="ih-card px-6 py-6" key={item.label}><p className="text-xs font-semibold ih-muted">{item.label}</p><p className="text-3xl font-extrabold tracking-tight mt-2">{item.value}</p></div>)}</div>
  <section className="ih-card overflow-hidden">
    <div className="px-6 py-6 flex flex-wrap gap-4 justify-between items-center border-b border-[#e5ece2]"><div><h2 className="font-bold text-lg">Course library</h2><p className="text-xs ih-muted mt-1">{filtered.length} matching courses</p></div>
      <div className="flex flex-wrap gap-3"><div className="relative"><MagnifyingGlassIcon className="w-4 h-4 absolute top-1/2 left-3 -translate-y-1/2 text-[#829185]"/><input type="search" className="ih-input !min-h-[40px] !pl-9" aria-label="Search your courses" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search courses"/></div><select aria-label="Filter publication status" className="ih-input !min-h-[40px] !w-[145px]" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All courses</option><option value="published">Published</option><option value="draft">Drafts</option></select><button aria-label="Refresh courses" type="button" className="ih-btn ih-btn-neutral !min-h-10 !px-3" onClick={()=>setRefresh(x=>x+1)}><ArrowPathIcon className="h-4 w-4"/></button></div>
    </div>
    {error&&<p role="alert" className="m-6 text-sm text-red-700 bg-red-50 border border-red-200 p-4 rounded-xl">{error}</p>}
    {loading?<div className="p-7 space-y-4" aria-label="Loading course library">{[0,1,2,3].map(i=><div key={i} className="ih-skeleton h-20"/>)}</div>:
    filtered.length===0?<div className="ih-empty !border-0"><AcademicCapIcon className="w-11 h-11 text-[#4c8c61]"/><h3 className="mt-5 text-xl font-bold">Your course library is ready</h3><p className="mt-2 text-sm ih-muted max-w-md">{courses.length?'Try a different search or publication status.':'Create your first course to start building a curriculum.'}</p><Link href="/dashboard/educator/courses/create" className="ih-btn ih-btn-primary mt-6">Create a course <ArrowUpRightIcon className="h-4 w-4"/></Link></div>:
    <div className="overflow-x-auto"><table className="min-w-[750px] w-full text-left"><thead><tr>{['Course','Status','Students','Created','Actions'].map(h=><th key={h} className="px-6 py-4 text-xs font-bold tracking-[.08em] uppercase text-[#667c69]">{h}</th>)}</tr></thead><tbody className="divide-y divide-[#e9f0e8]">{filtered.map(c=><tr key={c._id} className="hover:bg-[#fbfdf9]"><td className="px-6 py-5"><div className="flex items-center gap-4"><div className="w-14 h-12 relative rounded-xl overflow-hidden bg-[#dcecdc] shrink-0">{validArt(c.thumbnail?.url)?<Image src={c.thumbnail!.url!} alt="" fill unoptimized sizes="56px" className="object-cover"/>:<AcademicCapIcon className="w-6 h-6 text-[#38865a] absolute inset-0 m-auto"/>}</div><div><p className="text-sm font-bold line-clamp-2">{c.title}</p><p className="text-xs ih-muted mt-1">{c.category||'Learning'} · {c.level||'Course'}</p></div></div></td><td className="px-6 py-5"><span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${c.isPublished?'bg-[#e3f2e5] text-[#2a7950]':'bg-[#f4efdf] text-[#806c47]'}`}>{c.isPublished?'Published':'Draft'}</span></td><td className="px-6 py-5 text-sm font-semibold"><span className="inline-flex gap-2 items-center"><UserGroupIcon className="w-4 h-4 text-[#699978]"/>{c.enrolledStudents?.length??c.studentsCount??0}</span></td><td className="px-6 py-5 text-xs ih-muted">{c.createdAt?new Date(c.createdAt).toLocaleDateString('en-GB'):'—'}</td><td className="px-6 py-5"><div className="flex gap-3"><Link href={`/dashboard/educator/courses/${encodeURIComponent(c._id)}/edit`} className="text-xs font-bold text-[#2b7950] inline-flex gap-1 items-center"><PencilSquareIcon className="w-4 h-4"/>Edit</Link>{c.isPublished&&<Link className="text-xs font-semibold text-[#52785f] hover:underline" href={`/courses/${c._id}`}>View</Link>}<button type="button" className="text-xs text-red-700 font-semibold inline-flex gap-1 items-center disabled:opacity-50" disabled={deleting===c._id} onClick={()=>void remove(c)}><TrashIcon className="w-4 h-4"/>{deleting===c._id?'Deleting...':'Delete'}</button></div></td></tr>)}</tbody></table></div>}
  </section>
 </div></div>;
}
