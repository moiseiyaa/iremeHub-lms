'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '../../../api/apiClient';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

interface EnrollmentRequest {
 _id:string;status:'pending'|'approved'|'rejected';courseId?:{_id:string;title:string};studentId?:{_id:string;name:string;email?:string};createdAt:string
}
export default function RequestsPage(){
 const [items,setItems]=useState<EnrollmentRequest[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [pending,setPending]=useState<string|null>(null);
 const load=async()=>{setLoading(true);setError('');const res=await apiGet<EnrollmentRequest[]>('/educator/requests',true);if(res.success&&Array.isArray(res.data))setItems(res.data.filter(item=>item.status==='pending'));else setError(res.error||'Unable to load enrollment requests.');setLoading(false)};
 useEffect(()=>{void load()},[]);
 const decide=async(id:string,status:'approved'|'rejected')=>{setPending(id);setError('');const res=await apiPatch(`/educator/requests/${id}`,{status},true);if(res.success)setItems(prev=>prev.filter(item=>item._id!==id));else setError(res.error||'Unable to update the request.');setPending(null)};
 return <div className="min-h-screen bg-[#f5f7f2] py-10"><div className="ih-container"><div className="mb-8"><span className="ih-eyebrow">Enrollment desk</span><h1 className="text-3xl font-bold tracking-[-.045em] mt-4">Enrollment requests</h1><p className="ih-muted text-sm mt-3">Review pending requests from learners and approve access to your courses.</p></div>
 <div className="ih-card overflow-hidden">
 {error&&<p role="alert" className="bg-red-50 text-red-700 border border-red-200 rounded-xl mx-6 mt-5 p-4 text-sm">{error}</p>}
 {loading?<div className="p-7 space-y-3">{[1,2,3].map(i=><div key={i} className="ih-skeleton h-14"/>)}</div>:items.length===0?<div className="ih-empty !border-0"><ClipboardDocumentCheckIcon className="w-10 h-10 text-[#458d65]"/><h2 className="font-bold text-xl mt-5">No pending requests</h2><p className="text-sm ih-muted mt-2">Enrollment requests will appear here when learners apply.</p></div>:<div className="overflow-x-auto"><table className="w-full text-left min-w-[640px]"><thead className="bg-[#f2f7ef]"><tr>{['Learner','Course','Requested','Action'].map(h=><th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#66816a]">{h}</th>)}</tr></thead><tbody className="divide-y divide-[#e5eee5]">{items.map(item=><tr key={item._id}><td className="px-6 py-5"><p className="font-semibold text-sm">{item.studentId?.name||'Learner'}</p><p className="text-xs ih-muted mt-1">{item.studentId?.email}</p></td><td className="px-6 py-5 text-sm">{item.courseId?.title||'Course'}</td><td className="px-6 py-5 text-xs ih-muted">{new Date(item.createdAt).toLocaleDateString()}</td><td className="px-6 py-5"><div className="flex gap-2"><button type="button" disabled={pending===item._id} onClick={()=>void decide(item._id,'approved')} className="ih-btn ih-btn-primary !text-xs !px-3 !py-2 !min-h-[37px]">Approve</button><button type="button" disabled={pending===item._id} onClick={()=>void decide(item._id,'rejected')} className="ih-btn ih-btn-neutral !text-xs !px-3 !py-2 !min-h-[37px]">Decline</button></div></td></tr>)}</tbody></table></div>}
 </div></div></div>;
}
