'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowUpRightIcon, EnvelopeIcon, BuildingOffice2Icon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

type Inquiry = {name:string;email:string;subject:string;message:string};
export default function ContactPage(){
  const [data,setData]=useState<Inquiry>({name:'',email:'',subject:'',message:''});
  const [pending,setPending]=useState(false);
  const [message,setMessage]=useState('');
  const [complete,setComplete]=useState(false);
  const update=(key:keyof Inquiry,value:string)=>setData(v=>({...v,[key]:value}));
  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();setMessage('');setPending(true);
    try {
      // The response is only successful if a real receiving endpoint acknowledges it.
      const res=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const payload=await res.json().catch(()=>null);
      if(!res.ok||payload?.success!==true)throw new Error(payload?.error || 'Contact submissions are not yet available. Please check back soon.');
      setComplete(true);setData({name:'',email:'',subject:'',message:''});
    } catch(err){setMessage(err instanceof Error?err.message:'Unable to send your message at the moment.');}
    finally{setPending(false);}
  };
  return <div className="bg-[#f5f7f2] min-h-screen">
    <header className="bg-[#113c2f] text-white py-16 lg:py-24"><div className="ih-container"><span className="ih-eyebrow !text-[#bde1c3]">Get in touch</span><h1 className="ih-display max-w-3xl mt-6">Let's build something <span className="text-[#d8f59d]">meaningful.</span></h1><p className="mt-6 max-w-xl text-[#b8d2c3] leading-8">Questions about learning, teaching or adopting iremehub+ for your institution? Start the conversation here.</p></div></header>
    <div className="ih-container py-16 lg:py-24 grid gap-10 lg:grid-cols-[.85fr_1.15fr] items-start">
      <div><span className="ih-eyebrow">Let's connect</span><h2 className="ih-heading mt-5">We're listening.</h2><p className="ih-lead !text-base mt-5">Tell us what you want to achieve with digital learning. This page is ready for a contact service to be connected.</p><div className="mt-10 space-y-5">
        <div className="flex gap-4"><div className="rounded-2xl bg-[#e2eee4] p-3 h-fit"><BuildingOffice2Icon className="w-6 h-6 text-[#327553]"/></div><div><h3 className="font-bold">Institution partnerships</h3><p className="text-sm text-[#718578] mt-1">Explore learning experiences tailored to your team.</p></div></div>
        <div className="flex gap-4"><div className="rounded-2xl bg-[#e2eee4] p-3 h-fit"><ChatBubbleLeftRightIcon className="w-6 h-6 text-[#327553]"/></div><div><h3 className="font-bold">Product feedback</h3><p className="text-sm text-[#718578] mt-1">Share ideas for the platform as it evolves.</p></div></div>
      </div><Link href="/about" className="mt-5 inline-flex items-center text-[#28754f] font-bold text-sm gap-2">Learn about iremehub+ <ArrowUpRightIcon className="w-4 h-4"/></Link></div>
      <div className="ih-card p-7 sm:p-10"><div className="flex items-center justify-between gap-4 flex-wrap"><h2 className="text-2xl font-bold tracking-tight">Send an inquiry</h2><span className="ih-badge">Contact</span></div><p className="text-sm text-[#758b7d] mt-3 mb-8">Complete the fields below. Delivery requires the contact service to be configured.</p>
        {complete ? <div role="status" className="rounded-2xl bg-[#e5f3e6] p-6"><EnvelopeIcon className="h-8 w-8 text-[#377a56]"/><h3 className="font-bold text-lg mt-4">Inquiry received</h3><p className="mt-2 text-sm text-[#547563]">The contact service acknowledged your message.</p><button type="button" onClick={()=>setComplete(false)} className="ih-btn ih-btn-neutral mt-5">Send another message</button></div>:
        <form className="space-y-5" onSubmit={submit}>
          <div className="grid sm:grid-cols-2 gap-5"><div><label className="ih-form-label" htmlFor="contact-name">Full name</label><input className="ih-input" id="contact-name" autoComplete="name" required maxLength={100} value={data.name} onChange={e=>update('name',e.target.value)} placeholder="Your name"/></div><div><label className="ih-form-label" htmlFor="contact-email">Email address</label><input className="ih-input" id="contact-email" type="email" required maxLength={254} autoComplete="email" value={data.email} onChange={e=>update('email',e.target.value)} placeholder="name@example.com"/></div></div>
          <div><label className="ih-form-label" htmlFor="contact-subject">What can we help with?</label><select className="ih-input" id="contact-subject" required value={data.subject} onChange={e=>update('subject',e.target.value)}><option value="">Select a topic</option><option>Institution partnerships</option><option>Course questions</option><option>Product feedback</option><option>Other</option></select></div>
          <div><label className="ih-form-label" htmlFor="contact-message">Your message</label><textarea className="ih-input !min-h-[150px] resize-y" id="contact-message" required minLength={10} maxLength={3000} value={data.message} onChange={e=>update('message',e.target.value)} placeholder="Tell us a little about your goals..."/></div>
          {message&&<p role="alert" className="text-sm rounded-xl border border-red-200 bg-red-50 text-red-700 p-3">{message}</p>}
          <button type="submit" disabled={pending} className="ih-btn ih-btn-primary w-full disabled:opacity-50">{pending?'Sending...':'Send inquiry'}<ArrowUpRightIcon className="w-5 h-5"/></button>
        </form>}</div>
    </div>
  </div>;
}
