'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeftIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { apiGet } from '../../api/apiClient';

interface Article { _id:string; title:string; content:string; excerpt?:string; category?:string; createdAt?:string; author?:{name?:string}; status?:string }
export default function ArticlePage(){
  const params=useParams();
  const id=String(params?.id || '');
  const [post,setPost]=useState<Article|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  useEffect(()=>{let active=true; if(!id)return; (async()=>{const response=await apiGet<Article>(`/blogs/${encodeURIComponent(id)}`);if(!active)return;if(response.success && response.data && response.data.status==='published')setPost(response.data);else setError(response.error||'This article was not found.');setLoading(false)})();return()=>{active=false};},[id]);
  return <article className="bg-[#f5f7f2] min-h-[75vh] py-12 lg:py-20"><div className="ih-container max-w-[850px]"><Link href="/blog" className="text-sm font-semibold text-[#367e59] inline-flex items-center gap-2"><ArrowLeftIcon className="w-4 h-4"/> All articles</Link>{loading?<div className="ih-skeleton mt-9 h-[450px]" aria-label="Loading article"/>:error||!post?<div className="ih-empty mt-10"><NewspaperIcon className="w-10 h-10"/><h1 className="text-xl font-bold mt-4">Article unavailable</h1><p className="ih-muted text-sm mt-2">{error}</p></div>:<><span className="ih-eyebrow mt-12">{post.category||'Journal'}</span><h1 className="ih-heading mt-5 !text-[clamp(2.4rem,5vw,4.3rem)]">{post.title}</h1><p className="ih-lead mt-5">{post.excerpt}</p><div className="text-xs text-[#7a8e80] mt-6 mb-9">{[post.author?.name, post.createdAt?new Date(post.createdAt).toLocaleDateString():null].filter(Boolean).join(' · ')}</div><div className="ih-card px-7 py-9 sm:p-12 whitespace-pre-wrap text-[#2d4937] leading-8 text-base">{post.content}</div></>}</div></article>;
}
