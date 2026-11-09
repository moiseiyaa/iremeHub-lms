'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRightIcon, MagnifyingGlassIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { apiGet } from '../api/apiClient';

interface Article { _id: string; slug?: string; title: string; excerpt?: string; category?: string; createdAt?: string; featuredImage?: {url?: string}; author?: {name?:string}; status?: string; }
export default function BlogPage(){
  const [posts,setPosts]=useState<Article[]>([]);
  const [query,setQuery]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  useEffect(()=>{let mounted=true;(async()=>{
    const response=await apiGet<Article[]>('/blogs');
    if(!mounted)return;
    if(response.success && Array.isArray(response.data))setPosts(response.data.filter(post=>post.status==='published'));
    else setError(response.error||'Journal entries are temporarily unavailable.');
    setLoading(false);
  })();return()=>{mounted=false};},[]);
  const filtered=useMemo(()=>posts.filter(p=>[p.title,p.excerpt||'',p.category||''].join(' ').toLowerCase().includes(query.toLowerCase())),[posts,query]);
  return <div className="bg-[#f5f7f2] min-h-screen">
    <header className="bg-[#e6f0e6] py-16 lg:py-24"><div className="ih-container"><span className="ih-eyebrow">The iremehub+ journal</span><h1 className="ih-display mt-6 max-w-3xl">Ideas worth <span className="text-[#408a64]">sharing.</span></h1><p className="ih-lead mt-6">Conversations about teaching, learning, and the future of education.</p></div></header>
    <div className="ih-container py-12 lg:py-16">
      <div className="flex flex-wrap justify-between items-center gap-6 mb-9"><div><h2 className="text-2xl font-bold tracking-tight">Latest articles</h2><p className="text-[#708479] text-sm mt-1">{loading?'Loading articles...':`${filtered.length} published ${filtered.length===1?'article':'articles'}`}</p></div><div className="relative w-full sm:w-[300px]"><MagnifyingGlassIcon className="absolute top-1/2 -translate-y-1/2 left-4 h-5 w-5 text-[#6e8976]"/><input className="ih-input !pl-12" type="search" aria-label="Search articles" placeholder="Search articles..." value={query} onChange={e=>setQuery(e.target.value)}/></div></div>
      {loading?<div className="grid md:grid-cols-3 gap-6" aria-label="Loading articles">{[0,1,2].map(i=><div key={i} className="ih-skeleton h-[340px]"/>)}</div>:
      filtered.length===0?<div className="ih-empty"><NewspaperIcon className="h-11 w-11 text-[#449267]"/><h3 className="mt-5 font-bold text-xl">{error?'The journal is unavailable':posts.length===0?'Our journal is taking shape':'No articles matched'}</h3><p className="ih-muted text-sm mt-2">{error||'Check back for new stories and perspectives.'}</p>{query&&<button type="button" className="ih-btn ih-btn-neutral mt-5" onClick={()=>setQuery('')}>Clear search</button>}</div>:
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">{filtered.map(post=><article key={post._id} className="ih-card ih-course-card group overflow-hidden flex flex-col"><Link href={`/blog/${post._id}`} className="block" aria-label={`Read ${post.title}`}><div className="ih-course-art !aspect-[16/10]">{post.featuredImage?.url ? <Image src={post.featuredImage.url} alt="" fill unoptimized sizes="(max-width: 768px) 100vw, 400px" className="object-cover"/>:<div className="absolute inset-0 flex items-center justify-center bg-[#dbeadd]"><NewspaperIcon className="w-16 h-16 text-[#659679]"/></div>}</div></Link><div className="p-7 flex flex-col flex-1"><div className="text-xs font-semibold text-[#548468] uppercase tracking-[.09em]">{post.category||'Learning'}{post.createdAt&&<span className="ml-3 normal-case text-[#91a195]">{new Date(post.createdAt).toLocaleDateString('en-GB',{month:'short',day:'numeric',year:'numeric'})}</span>}</div><h3 className="mt-4 text-xl font-bold leading-7 tracking-tight"><Link href={`/blog/${post._id}`}>{post.title}</Link></h3><p className="mt-3 text-sm leading-7 text-[#6f8274] flex-1">{post.excerpt||'Read this article.'}</p><Link href={`/blog/${post._id}`} className="mt-6 text-sm text-[#27704e] font-bold inline-flex gap-2 items-center">Read article <ArrowUpRightIcon className="w-4 h-4"/></Link></div></article>)}</div>}
    </div>
  </div>;
}
