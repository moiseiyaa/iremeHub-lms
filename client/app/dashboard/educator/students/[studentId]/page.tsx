'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { UserCircleIcon, ArrowLeftIcon, BookOpenIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { apiGet } from '../../../../api/apiClient';

interface Student {_id:string;name:string;email:string;createdAt?:string}
interface Course {_id:string;courseId:string;title:string;category?:string;progress:number;completed:boolean;enrolledAt:string;completedAt?:string}
interface StudentPage {student:Student;courses:Course[]}
export default function StudentDetailPage(){
 const params=useParams();const id=String(params?.studentId||'');
 const [data,setData]=useState<StudentPage|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 useEffect(()=>{if(!id)return;let live=true;(async()=>{
  setLoading(true);setError('');
  const result=await apiGet<StudentPage>(`/educator/students/${encodeURIComponent(id)}`,true);
  if(!live)return;
  if(result.success && result.data)setData(result.data);
  else setError(result.error||'Student information is unavailable.');
  setLoading(false);
 })();return()=>{live=false}},[id]);
 return <div className="bg-[#f5f7f2] min-h-[75vh] py-12 lg:py-16"><div className="ih-container max-w-[960px]">
  <Link href="/dashboard/educator/students" className="text-sm font-bold text-[#26714d] inline-flex gap-2 items-center"><ArrowLeftIcon className="w-5 h-5"/> Back to learners</Link>
  {loading?<div className="mt-8 ih-skeleton h-[470px]"/>:!data?<div className="ih-empty mt-9"><UserCircleIcon className="w-11 h-11 text-[#50906a]"/><h1 className="text-xl font-bold mt-5">Learner unavailable</h1><p role="alert" className="ih-muted text-sm mt-2">{error}</p></div>:
   <><div className="ih-card mt-8 overflow-hidden"><div className="bg-[#e4f0e5] p-8 sm:p-10 flex items-center gap-5"><div className="w-17 h-17 shrink-0 rounded-2xl bg-white grid place-items-center"><UserCircleIcon className="w-10 h-10 text-[#468b61]"/></div><div><span className="ih-eyebrow">Learner profile</span><h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-3">{data.student.name}</h1><p className="text-sm text-[#64806e] mt-2">{data.student.email}</p></div></div><div className="p-8 sm:p-10 grid sm:grid-cols-2 gap-5"><div><p className="ih-muted text-sm">Courses with this educator</p><p className="text-3xl font-bold mt-2">{data.courses.length}</p></div><div><p className="ih-muted text-sm">Joined platform</p><p className="font-bold mt-2">{data.student.createdAt?new Date(data.student.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—'}</p></div></div></div>
   <section className="mt-9"><span className="ih-eyebrow">Learning journey</span><h2 className="text-2xl font-bold tracking-tight mt-3 mb-6">Enrolled courses</h2>{data.courses.length===0?<div className="ih-empty"><BookOpenIcon className="h-10 w-10 text-[#4e926b]"/><p className="mt-4 ih-muted">No course progress for this educator.</p></div>:<div className="space-y-4">{data.courses.map(course=><article key={course._id} className="ih-card p-6 sm:p-7 flex flex-wrap justify-between gap-6 items-center"><div className="flex-1 min-w-[200px]"><span className="text-xs font-bold text-[#5d8a6b] uppercase tracking-[.1em]">{course.category||'Learning'}</span><h3 className="text-lg font-bold mt-2">{course.title}</h3><p className="text-xs ih-muted mt-2">{course.completed?'Completed':'In progress'}</p><div className="mt-4 max-w-sm"><div className="flex justify-between text-xs font-semibold text-[#437457]"><span>Progress</span><span>{Math.round(Math.min(100,Math.max(0,course.progress||0)))}%</span></div><div className="h-2 mt-2 rounded-full bg-[#e6eee4] overflow-hidden"><div className="h-full rounded-full bg-[#3d9365]" style={{width:`${Math.min(100,Math.max(0,course.progress||0))}%`}}/></div></div></div><div>{course.completed?<CheckCircleIcon className="w-8 h-8 text-[#4b9564]"/>:null}<Link href={`/dashboard/educator/courses/${course.courseId}/edit`} className="text-xs font-bold text-[#2c7652] block mt-2">Manage course</Link></div></article>)}</div>}</section></>}
 </div></div>;
}
