'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { BellIcon, PlusIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../api/apiClient';

type Notice = {_id:string;title:string;content:string;published:boolean;courseId?:{_id:string;title:string}|string|null;createdAt?:string};
type Course = {_id:string;title:string};
type Draft = {title:string;content:string;published:boolean;courseId:string};
const blank:Draft={title:'',content:'',published:true,courseId:''};

export default function AnnouncementsPage(){
 const [items,setItems]=useState<Notice[]>([]);
 const [courses,setCourses]=useState<Course[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [working,setWorking]=useState(false);
 const [editing,setEditing]=useState<string|null>(null);
 const [open,setOpen]=useState(false);
 const [draft,setDraft]=useState<Draft>(blank);
 const [search,setSearch]=useState('');
 const reload=async()=>{
   setLoading(true);setError('');
   const [a,c]=await Promise.all([apiGet<Notice[]>('/announcements/educator/list',true),apiGet<Course[]>('/educator/courses',true)]);
   if(a.success&&Array.isArray(a.data))setItems(a.data);
   else setError(a.error||'Could not load announcements.');
   if(c.success&&Array.isArray(c.data))setCourses(c.data);
   setLoading(false);
 };
 useEffect(()=>{void reload()},[]);
 const begin=(item?:Notice)=>{
   setError('');setEditing(item?._id||null);
   setDraft(item?{title:item.title,content:item.content,published:item.published,courseId:typeof item.courseId==='string'?item.courseId:item.courseId?._id||''}:blank);
   setOpen(true);
 };
 const save=async(e:FormEvent<HTMLFormElement>)=>{
   e.preventDefault();setWorking(true);setError('');
   const payload={title:draft.title.trim(),content:draft.content.trim(),published:draft.published,courseId:draft.courseId||null};
   const result=editing?await apiPut<Notice>(`/announcements/${editing}`,payload,true):await apiPost<Notice>('/announcements',payload,true);
   if(result.success){setOpen(false);void reload();}
   else setError(result.error||'Could not save announcement.');
   setWorking(false);
 };
 const toggle=async(item:Notice)=>{
   const result=await apiPost<Notice>(`/announcements/${item._id}/toggle-publish`,{},true);
   if(result.success&&result.data)setItems(prev=>prev.map(x=>x._id===item._id?{...x,published:result.data!.published}:x));
   else setError(result.error||'Could not update publication status.');
 };
 const remove=async(item:Notice)=>{
   if(!window.confirm(`Delete "${item.title}" permanently?`))return;
   const result=await apiDelete(`/announcements/${item._id}`,true);
   if(result.success)setItems(prev=>prev.filter(x=>x._id!==item._id));
   else setError(result.error||'Could not delete announcement.');
 };
 const filtered=items.filter(x=>[x.title,x.content].join(' ').toLowerCase().includes(search.toLowerCase()));
 return <div className="bg-[#f5f7f2] min-h-screen py-10"><div className="ih-container">
  <div className="flex flex-wrap gap-5 justify-between items-end mb-9"><div><span className="ih-eyebrow">Educator communications</span><h1 className="text-3xl sm:text-4xl font-bold tracking-[-.05em] mt-4">Announcements.</h1><p className="text-sm ih-muted mt-3">Keep your learners informed about lessons and course updates.</p></div><button type="button" onClick={()=>begin()} className="ih-btn ih-btn-primary"><PlusIcon className="w-5 h-5"/>New announcement</button></div>
  {error&&<p role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5 text-sm">{error}</p>}
  <section className="ih-card overflow-hidden"><div className="p-6 border-b border-[#e7eee5] flex flex-wrap gap-4 justify-between items-center"><div><h2 className="text-lg font-bold">Message library</h2><p className="text-xs ih-muted mt-2">{filtered.length} announcements</p></div><input className="ih-input !w-[245px]" type="search" value={search} onChange={e=>setSearch(e.target.value)} aria-label="Search announcements" placeholder="Search announcements"/></div>
    {loading?<div className="p-7 space-y-3">{[0,1,2].map(i=><div key={i} className="ih-skeleton h-20"/>)}</div>:
     filtered.length===0?<div className="ih-empty !border-0"><BellIcon className="h-10 w-10 text-[#4a9567]"/><h3 className="font-bold text-xl mt-5">No announcements found</h3><p className="text-sm ih-muted mt-2">Create a message or change your search.</p></div>:
     <div className="divide-y divide-[#e7eee5]">{filtered.map(item=><article key={item._id} className="p-6 flex flex-wrap justify-between gap-5"><div className="max-w-[650px]"><span className={`text-xs rounded-full px-3 py-1 font-bold ${item.published?'bg-[#e4f2e3] text-[#25744a]':'bg-[#f5eedf] text-[#806e4e]'}`}>{item.published?'Published':'Draft'}</span><h3 className="font-bold text-lg mt-4">{item.title}</h3><p className="text-sm ih-muted leading-7 mt-2 line-clamp-3">{item.content}</p><p className="text-xs ih-muted mt-3">{typeof item.courseId==='object'&&item.courseId?item.courseId.title:'General update'}</p></div><div className="flex flex-wrap h-fit gap-2"><button type="button" className="ih-btn ih-btn-neutral !text-xs !min-h-10 !px-3" onClick={()=>begin(item)}><PencilIcon className="w-4 h-4"/>Edit</button><button type="button" className="ih-btn ih-btn-neutral !text-xs !min-h-10 !px-3" onClick={()=>void toggle(item)}>{item.published?'Unpublish':'Publish'}</button><button type="button" className="ih-btn ih-btn-neutral !text-xs !min-h-10 !px-3 !text-red-700" onClick={()=>void remove(item)}><TrashIcon className="w-4 h-4"/>Delete</button></div></article>)}</div>}
  </section>
  {open&&<div role="presentation" className="fixed inset-0 bg-[#0c281b]/75 z-[110] p-4 flex justify-center items-center overflow-y-auto"><div role="dialog" aria-modal="true" aria-labelledby="announcement-dialog-title" className="w-full max-w-[580px] rounded-3xl bg-white p-7 sm:p-9"><div className="flex gap-4 items-center justify-between"><h2 id="announcement-dialog-title" className="text-xl font-bold">{editing?'Edit announcement':'Create announcement'}</h2><button type="button" onClick={()=>setOpen(false)} aria-label="Close announcement form" className="text-xl rounded-lg p-2 hover:bg-[#edf3eb]">×</button></div>
    <form onSubmit={e=>void save(e)} className="mt-6 space-y-4"><div><label htmlFor="notice-title" className="ih-form-label">Title</label><input id="notice-title" className="ih-input" maxLength={100} required value={draft.title} onChange={e=>setDraft(v=>({...v,title:e.target.value}))}/></div><div><label htmlFor="notice-body" className="ih-form-label">Message</label><textarea id="notice-body" className="ih-input !min-h-[150px]" maxLength={5000} required value={draft.content} onChange={e=>setDraft(v=>({...v,content:e.target.value}))}/></div><div><label htmlFor="notice-audience" className="ih-form-label">Audience</label><select id="notice-audience" className="ih-input" value={draft.courseId} onChange={e=>setDraft(v=>({...v,courseId:e.target.value}))}><option value="">General update</option>{courses.map(c=><option key={c._id} value={c._id}>{c.title}</option>)}</select></div><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={draft.published} onChange={e=>setDraft(v=>({...v,published:e.target.checked}))}/> Publish now</label>{error&&<p role="alert" className="text-red-700 text-sm">{error}</p>}<div className="flex gap-3 justify-end"><button type="button" className="ih-btn ih-btn-neutral" onClick={()=>setOpen(false)}>Cancel</button><button type="submit" className="ih-btn ih-btn-primary" disabled={working}><CheckIcon className="w-4 h-4"/>{working?'Saving...':'Save'}</button></div></form>
   </div></div>}
 </div></div>;
}
