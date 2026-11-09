'use client';

import { useEffect, useState } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/outline';

export default function ScrollToTop(){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
   const handler=()=>setVisible(window.scrollY>380);
   handler();window.addEventListener('scroll',handler,{passive:true});
   return()=>window.removeEventListener('scroll',handler);
 },[]);
 return <button type="button" tabIndex={visible?0:-1} aria-hidden={!visible} onClick={()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})} className={`fixed bottom-6 right-5 sm:right-8 z-50 h-12 w-12 rounded-2xl bg-[#19654e] text-white grid place-items-center shadow-xl hover:bg-[#104a39] transition-all duration-200 ${visible?'opacity-100 translate-y-0':'opacity-0 translate-y-5 pointer-events-none'}`} aria-label="Scroll to top"><ArrowUpIcon className="w-5 h-5"/></button>;
}
