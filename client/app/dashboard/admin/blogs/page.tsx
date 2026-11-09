'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRightIcon, MagnifyingGlassIcon, PencilSquareIcon, TrashIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { apiGet, apiDelete } from '../../../api/apiClient';

interface Post { _id:string;title:string;slug?:string;excerpt?:string;status:'draft'|'published'|'archived';category:string;createdAt:string;author?:{name?:string} }
type StatusFilter='all'|'draft'|'published'|'archived';

export default function AdminBlogsPage(){
  const [posts,setPosts]=useState<Post[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [search,setSearch]=useState('');
  const [status,setStatus]=useState<StatusFilter>('all');
  const [removing,setRemoving]=useState<string|null>(null);
  const reload=async()=>{
    setLoading(true);setError('');
    const response=await apiGet<Post[]>('/blogs/manage?limit=50',true);
    if(response.success&&Array.isArray(response.data))setPosts(response.data);
    else setError(response.error||'Unable to load posts.');
    setLoading(false);
  };
  useEffect(()=>{void reload()},[]);
  const filtered=useMemo(()=>posts.filter(post=>(status==='all'||post.status===status)&&[post.title,post.category,post.excerpt||''].join(' ').toLowerCase().includes(search.toLowerCase())),[posts,status,search]);
  const remove=async(post:Post)=>{
    if(!window.confirm(`Delete "${post.title}"? This action cannot be undone.`))return;
    setRemoving(post._id);
    const response=await apiDelete(`/blogs/${post._id}`,true);
    if(response.success)setPosts(all=>all.filter(item=>item._id!==post._id));
    else setError(response.error||'Failed to delete this post.');
    setRemoving(null);
  };
  return <div className="min-h-screen bg-[#f5f7f2] py-9"><div className="ih-container">
    <div className="flex flex-wrap gap-6 justify-between items-end mb-8"><div><span className="ih-eyebrow">Content studio</span><h1 className="text-3xl sm:text-4xl font-extrabold tracking-[-.05em] mt-4">Manage articles</h1><p className="text-sm ih-muted mt-3">Review drafts, publish stories and maintain your journal.</p></div><Link href="/dashboard/admin/blogs/new" className="ih-btn ih-btn-primary">Create an article <ArrowUpRightIcon className="w-5 h-5"/></Link></div>
    <div className="ih-card overflow-hidden">
      <div className="p-6 flex flex-wrap justify-between gap-4 items-center border-b border-[#e2eae2]"><div><h2 className="font-bold text-lg">Articles</h2><p className="ih-muted text-xs mt-1">{posts.length} posts retrieved</p></div><div className="flex gap-3 flex-wrap"><div className="relative"><MagnifyingGlassIcon className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 text-[#718d7a]"/><input value={search} onChange={e=>setSearch(e.target.value)} className="ih-input !pl-9 !min-h-10 w-[200px]" type="search" aria-label="Search journal posts" placeholder="Search posts"/></div><select className="ih-input !min-h-10 w-[145px]" value={status} onChange={e=>setStatus(e.target.value as StatusFilter)} aria-label="Filter post status">{['all','draft','published','archived'].map(s=><option key={s} value={s}>{s==='all'?'All statuses':s[0].toUpperCase()+s.slice(1)}</option>)}</select></div></div>
      {error&&<p role="alert" className="mx-6 mt-5 bg-red-50 border border-red-200 rounded-xl text-red-700 p-4 text-sm">{error}</p>}
      {loading?<div className="p-8 space-y-4">{[1,2,3,4].map(n=><div key={n} className="ih-skeleton h-16"/>)}</div>:
        filtered.length===0?<div className="ih-empty !border-0"><NewspaperIcon className="w-10 h-10 text-[#52966b]"/><h3 className="mt-5 font-bold text-xl">No articles found</h3><p className="text-sm ih-muted mt-2">Start a new article, or change the filters above.</p><Link href="/dashboard/admin/blogs/new" className="ih-btn ih-btn-primary mt-5">New article</Link></div>:
        <div className="overflow-x-auto"><table className="w-full min-w-[670px] text-left"><thead className="bg-[#f3f7f1]"><tr>{['Article','Status','Author','Created','Actions'].map(h=><th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-[.09em] text-[#617a6a]">{h}</th>)}</tr></thead><tbody className="divide-y divide-[#edf1ea]">{filtered.map(post=><tr key={post._id} className="hover:bg-[#fbfdf9]"><td className="px-6 py-5"><p className="font-bold text-sm">{post.title}</p><p className="text-xs text-[#859586] mt-1">{post.category}</p></td><td className="px-6 py-5"><span className={`px-3 py-1 rounded-full text-[11px] font-bold ${post.status==='published'?'bg-[#e2f2e2] text-[#247146]':'bg-[#f4eedf] text-[#826d43]'}`}>{post.status}</span></td><td className="px-6 py-5 text-sm text-[#687b6d]">{post.author?.name||'—'}</td><td className="px-6 py-5 text-xs text-[#728576]">{new Date(post.createdAt).toLocaleDateString()}</td><td className="px-6 py-5"><div className="flex items-center gap-3"><Link href={`/dashboard/admin/blogs/${post._id}/edit`} className="text-[#286e50] hover:underline inline-flex items-center gap-1 text-xs font-bold"><PencilSquareIcon className="w-4 h-4"/>Edit</Link>{post.status==='published'&&<Link href={`/blog/${post._id}`} className="text-[#45745a] text-xs font-semibold hover:underline">View</Link>}<button type="button" disabled={removing===post._id} onClick={()=>void remove(post)} className="text-red-700 text-xs font-semibold inline-flex gap-1 items-center disabled:opacity-50"><TrashIcon className="h-4 w-4"/>Delete</button></div></td></tr>)}</tbody></table></div>}
    </div>
    <p className="text-xs ih-muted mt-5">Showing up to 50 most recent posts. Extended pagination is part of the next data-management iteration.</p>
  </div></div>;
}
