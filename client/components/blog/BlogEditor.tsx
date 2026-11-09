'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, CheckIcon, EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { apiPost } from '../../app/api/apiClient';

type Visibility = 'draft'|'published';
type Draft = {title:string;excerpt:string;content:string;category:string;tags:string;status:Visibility};

export default function BlogEditor(){
 const router=useRouter();
 const [draft,setDraft]=useState<Draft>({title:'',excerpt:'',content:'',category:'Education',tags:'',status:'draft'});
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [preview,setPreview]=useState(false);
 const update=(key:keyof Draft,value:string)=>setDraft(v=>({...v,[key]:value}));
 const submit=async(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();setError('');setLoading(true);
  const payload={
   title:draft.title.trim(),excerpt:draft.excerpt.trim(),content:draft.content.trim(),
   category:draft.category.trim(),tags:draft.tags.split(',').map(t=>t.trim()).filter(Boolean),
   status:draft.status
  };
  if(!payload.title||!payload.excerpt||!payload.content||!payload.category){setError('Complete the required fields before publishing.');setLoading(false);return;}
  const result=await apiPost('/blogs',payload,true);
  if(result.success)router.push('/dashboard/admin/blogs');
  else setError(result.error||'Could not save this article.');
  setLoading(false);
 };
 return <div className="min-h-screen bg-[#f5f7f2] py-10"><div className="ih-container max-w-[1000px]">
  <div className="flex flex-wrap gap-5 justify-between items-end mb-8"><div><Link href="/dashboard/admin/blogs" className="text-sm font-bold text-[#2e8056] inline-flex gap-2 items-center"><ArrowLeftIcon className="w-4 h-4"/>All articles</Link><span className="ih-eyebrow !flex mt-6">Content studio</span><h1 className="text-3xl sm:text-4xl tracking-[-.05em] font-extrabold mt-4">Write a new article.</h1><p className="text-sm ih-muted mt-3">Share perspectives and ideas with the learning community.</p></div>
    <button type="button" onClick={()=>setPreview(v=>!v)} className="ih-btn ih-btn-neutral"><EyeIcon className="w-5 h-5"/>{preview?'Edit article':'Preview article'}</button></div>
  {preview?<article className="ih-card p-8 sm:p-12"><span className="ih-eyebrow">{draft.category||'Learning'}</span><h2 className="text-3xl font-extrabold tracking-tight mt-6">{draft.title||'Your article title'}</h2><p className="text-base text-[#78897d] mt-4">{draft.excerpt||'Your article summary will appear here.'}</p><div className="ih-divider my-8"/><div className="whitespace-pre-wrap leading-8 text-[#2b4635]">{draft.content||'Write your article to preview its content.'}</div></article>:
  <form className="ih-card p-7 sm:p-10 space-y-6" onSubmit={e=>void submit(e)}>
    <div><label className="ih-form-label" htmlFor="article-title">Title</label><input className="ih-input" id="article-title" required maxLength={200} value={draft.title} onChange={e=>update('title',e.target.value)} placeholder="A clear and engaging title"/></div>
    <div><label className="ih-form-label" htmlFor="article-excerpt">Summary</label><textarea className="ih-input !min-h-[100px]" id="article-excerpt" required maxLength={500} value={draft.excerpt} onChange={e=>update('excerpt',e.target.value)} placeholder="What will readers take away?"/><p className="text-xs ih-muted mt-2">{draft.excerpt.length}/500 characters</p></div>
    <div><label className="ih-form-label" htmlFor="article-content">Article content</label><textarea className="ih-input !min-h-[360px] font-mono text-sm leading-7" id="article-content" required value={draft.content} onChange={e=>update('content',e.target.value)} placeholder="Write your story..."/></div>
    <div className="grid md:grid-cols-2 gap-6"><div><label className="ih-form-label" htmlFor="article-category">Category</label><input className="ih-input" id="article-category" required maxLength={80} value={draft.category} onChange={e=>update('category',e.target.value)} placeholder="Education"/></div><div><label className="ih-form-label" htmlFor="article-tags">Tags</label><input className="ih-input" id="article-tags" value={draft.tags} onChange={e=>update('tags',e.target.value)} placeholder="learning, research, education"/><p className="mt-2 text-xs ih-muted">Separate tags with commas.</p></div></div>
    <div><label className="ih-form-label" htmlFor="article-status">Publishing</label><select className="ih-input" id="article-status" value={draft.status} onChange={e=>update('status',e.target.value as Visibility)}><option value="draft">Save as draft</option><option value="published">Publish immediately</option></select></div>
    <p className="rounded-xl bg-[#edf5eb] p-4 text-xs leading-6 text-[#547561]">Cover image uploads and rich-text editing will be available after the media service upgrade. This editor saves text articles directly through the existing API.</p>
    {error&&<p role="alert" className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">{error}</p>}
    <div className="flex flex-wrap justify-end gap-3 border-t border-[#e4ece2] pt-6"><Link href="/dashboard/admin/blogs" className="ih-btn ih-btn-neutral">Cancel</Link><button type="submit" disabled={loading} className="ih-btn ih-btn-primary disabled:opacity-50"><CheckIcon className="w-5 h-5"/>{loading?'Saving...':draft.status==='draft'?'Save draft':'Publish article'}</button></div>
  </form>}
  </div></div>;
}
