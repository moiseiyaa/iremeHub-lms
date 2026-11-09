'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { apiGet, apiPut } from '../app/api/apiClient';

interface Notice {_id:string;message:string;read:boolean;link?:string;createdAt:string}
export default function Notifications(){
  const [open,setOpen]=useState(false);
  const [items,setItems]=useState<Notice[]>([]);
  const [error,setError]=useState('');
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    let active=true;
    const load=async()=>{const result=await apiGet<Notice[]>('/notifications',true);if(!active)return;if(result.success&&Array.isArray(result.data)){setItems(result.data);setError('');}else setError('Notifications are temporarily unavailable.')};
    void load();const timer=window.setInterval(()=>{if(!document.hidden)void load()},60000);
    return()=>{active=false;window.clearInterval(timer)};
  },[]);
  useEffect(()=>{
    if(!open)return;
    const close=(e:MouseEvent)=>{if(!ref.current?.contains(e.target as Node))setOpen(false)};
    const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};
    document.addEventListener('mousedown',close);document.addEventListener('keydown',key);
    return()=>{document.removeEventListener('mousedown',close);document.removeEventListener('keydown',key)};
  },[open]);
  const unread=items.filter(i=>!i.read).length;
  const mark=async(id:string)=>{
    const result=await apiPut<Notice>(`/notifications/${id}/read`,{},true);
    if(result.success)setItems(prev=>prev.map(item=>item._id===id?{...item,read:true}:item));
  };
  const all=async()=>{const result=await apiPut('/notifications/readall',{},true);if(result.success)setItems(prev=>prev.map(i=>({...i,read:true})));};
  return <div ref={ref} className="relative">
    <button type="button" className="relative w-10 h-10 rounded-xl border border-[#dfe7e0] bg-white text-[#2f674b] grid place-items-center hover:bg-[#edf6ed]" onClick={()=>setOpen(v=>!v)} aria-label={`Notifications${unread?', '+unread+' unread':''}`} aria-expanded={open} aria-haspopup="dialog">
      <BellIcon className="w-5 h-5"/>{unread>0&&<span aria-hidden="true" className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-[10px] bg-[#c9ef86] text-[#123a2c] grid place-items-center font-extrabold">{unread}</span>}
    </button>
    {open&&<div role="dialog" aria-label="Notifications" className="absolute right-0 top-[52px] z-[90] w-[min(90vw,360px)] rounded-2xl border border-[#dfe8dd] bg-white shadow-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e5ece4] flex items-center justify-between"><div><h2 className="text-base font-bold">Notifications</h2><p className="text-xs text-[#75897b]">Your recent updates</p></div>{unread>0&&<button type="button" onClick={all} className="text-xs font-bold text-[#2b7e52] inline-flex gap-1 items-center"><CheckIcon className="w-4 h-4"/>Mark all read</button>}</div>
      <div className="max-h-80 overflow-y-auto">{error&&<p role="alert" className="p-5 text-sm text-[#8e5a40]">{error}</p>}
        {!error&&items.length===0&&<div className="py-12 px-6 text-center"><BellIcon className="w-8 h-8 mx-auto text-[#a4b9a9]"/><p className="text-sm font-semibold mt-4">You're all caught up</p><p className="text-xs text-[#819287] mt-1">New updates will appear here.</p></div>}
        {items.map(item=><div key={item._id} className={`border-b border-[#eff3ed] px-5 py-4 ${!item.read?'bg-[#f1f8f0]':''}`}>
          <p className="text-sm leading-6 text-[#244835]">{item.message}</p><div className="flex items-center justify-between gap-3 mt-2"><span className="text-[11px] text-[#87998a]">{item.createdAt?formatDistanceToNow(new Date(item.createdAt),{addSuffix:true}):''}</span>
          <div className="flex items-center gap-3">{!item.read&&<button className="text-xs font-semibold text-[#2a7950]" type="button" onClick={()=>void mark(item._id)}>Mark read</button>}{item.link?.startsWith('/')&&!item.link.startsWith('//')&&<Link href={item.link} onClick={()=>{setOpen(false);void mark(item._id)}} className="text-xs font-bold text-[#27694b]">Open</Link>}</div></div>
        </div>)}
      </div>
    </div>}
  </div>;
}
