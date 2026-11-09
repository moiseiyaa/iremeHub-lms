'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { apiGet, apiPut } from '../../../../../api/apiClient';

interface BlogDraft {_id:string;title:string;excerpt:string;content:string;category:string;status:'draft'|'published'|'archived';tags?:string[]}
export default function EditBlogPage(){
 const params=useParams();const router=useRouter();const id=String(params?.id||'');
 const [draft,setDraft]=useState<BlogDraft|null>(null);const [loading,setLoading]=useState(true);const [saving,setSaving]=useState(false);const [error,setError]=useState('');
 useEffect(()=>{let live=true;(async()=>{const response=await apiGet<BlogDraft>(`/blogs/manage/${encodeURIComponent(id)}`,true);if(!live)return;if(response.success&&response.data)setDraft(response.data);else setError(response.error||'Post unavailable.');setLoading(false);})();return()=>{live=false};},[id]);
 const set=(key:keyof BlogDraft,value:string)=>setDraft(current=>current?({...current,[key]:value}):current);
 const submit=async(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();if(!draft)return;setSaving(true);setError('');const result=await apiPut<BlogDraft>(`/blogs/${encodeURIComponent(id)}`,{title:draft.title,excerpt:draft.excerpt,content:draft.content,category:draft.category,status:draft.status},true);if(result.success)router.push('/dashboard/admin/blogs');else setError(result.error||'Could not update the article.');setSaving(false);};
 return <div className="min-h-screen bg-[#f5f7f2] py-10"><div className="ih-container max-w-[900px]"><Link href="/dashboard/admin/blogs" className="inline-flex gap-2 text-sm font-semibold text-[#2e7955] items-center"><ArrowLeftIcon className="w-4 h-4"/>Back to articles</Link><div className="mt-6 mb-8"><span className="ih-eyebrow">Content studio</span><h1 className="text-3xl font-bold tracking-[-.05em] mt-4">Edit article</h1></div>
 {loading?<div className="ih-skeleton h-[500px]"/>:!draft?<div className="ih-empty"><p role="alert">{error||'Article not found'}</p></div>:<form onSubmit={submit} className="ih-card p-7 sm:p-10 space-y-6"><div><label className="ih-form-label" htmlFor="blog-title">Title</label><input id="blog-title" className="ih-input" required maxLength={200} value={draft.title} onChange={e=>set('title',e.target.value)}/></div><div><label className="ih-form-label" htmlFor="blog-excerpt">Excerpt</label><textarea id="blog-excerpt" className="ih-input !min-h-[90px]" required maxLength={500} value={draft.excerpt} onChange={e=>set('excerpt',e.target.value)}/></div><div className="grid md:grid-cols-2 gap-5"><div><label htmlFor="blog-category" className="ih-form-label">Category</label><input id="blog-category" className="ih-input" required value={draft.category} onChange={e=>set('category',e.target.value)}/></div><div><label htmlFor="blog-status" className="ih-form-label">Publication status</label><select id="blog-status" className="ih-input" value={draft.status} onChange={e=>set('status',e.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div></div><div><label className="ih-form-label" htmlFor="blog-content">Article content</label><textarea id="blog-content" className="ih-input !min-h-[340px] font-mono text-sm leading-7" required value={draft.content} onChange={e=>set('content',e.target.value)}/><p className="text-xs text-[#819085] mt-2">Plain text editing. Rich text and preview tools are planned.</p></div>
 {error&&<p role="alert" className="text-sm bg-red-50 border border-red-200 rounded-xl p-3 text-red-700">{error}</p>}
 <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e4ebe4] pt-6"><Link href="/dashboard/admin/blogs" className="ih-btn ih-btn-neutral">Cancel</Link><button className="ih-btn ih-btn-primary" type="submit" disabled={saving}><CheckIcon className="w-5 h-5"/>{saving?'Saving...':'Save changes'}</button></div>
 </form>}</div></div>;
}
