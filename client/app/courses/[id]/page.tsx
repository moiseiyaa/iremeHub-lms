'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
 ArrowLeftIcon, ArrowUpRightIcon, BookOpenIcon, CheckCircleIcon,
 ClockIcon, LockClosedIcon, PlayCircleIcon, AcademicCapIcon,
 ChevronDownIcon, UserCircleIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';
import { apiGet, apiPost } from '../../api/apiClient';
import { useAuth } from '../../../components/auth/AuthProvider';

interface Lesson { _id:string;title:string;description?:string;order?:number;completionTime?:number;contentType?:string;isPreview?:boolean }
interface Section { _id:string;title:string;description?:string;order?:number;lessons?:Lesson[] }
interface Course {
 _id:string;title:string;description:string;category:string;level:string;price:number;thumbnail?:{url?:string};
 instructor?:{_id?:string;name?:string;bio?:string;avatar?:{url?:string}};
 sections?:Section[];averageRating?:string|number;ratings?:unknown[];
}
interface CourseProgress { isEnrolled:boolean;progress?:{progressPercentage?:number;nextLesson?:{_id:string}};course?:Course }

export default function CourseDetailsPage(){
 const params=useParams();const id=String(params?.id||'');const router=useRouter();
 const {user,isAuthenticated,loading:authLoading}=useAuth();
 const [course,setCourse]=useState<Course|null>(null);
 const [loading,setLoading]=useState(true);const [error,setError]=useState('');
 const [enrolled,setEnrolled]=useState(false);const [nextLesson,setNextLesson]=useState('');
 const [progress,setProgress]=useState(0);
 const [enrollmentStatus,setEnrollmentStatus]=useState<string|null>(null);
 const [submitting,setSubmitting]=useState(false);
 const [openSection,setOpenSection]=useState<string|null>(null);
 const [retry,setRetry]=useState(0);
 const viewer=user as {id?:string;_id?:string;role?:string}|null;
 const viewerId=viewer?.id||viewer?._id;
 const canEdit=Boolean(viewer && (viewer.role==='admin'||(viewer.role==='educator'&&viewerId===course?.instructor?._id)));
 const isStudent=viewer?.role==='student';
 useEffect(()=>{
  if(!id)return;let active=true;
  (async()=>{setLoading(true);setError('');
   const result=await apiGet<Course>(`/courses/${encodeURIComponent(id)}`);
   if(!active)return;
   if(result.success&&result.data){setCourse(result.data);setOpenSection(result.data.sections?.[0]?._id||null);}
   else {setCourse(null);setError(result.error||'This course is not available.');}
   setLoading(false);
  })();
  return()=>{active=false};
 },[id,retry]);
 useEffect(()=>{
  if(!isAuthenticated||!id||!isStudent)return;
  let active=true;
  (async()=>{
   const [result,request]=await Promise.all([
    apiGet<CourseProgress>(`/courses/${encodeURIComponent(id)}/with-progress`,true),
    apiGet<string|null>(`/courses/${encodeURIComponent(id)}/enrollment-request-status`,true)
   ]);
   if(!active)return;
   if(result.success&&result.data){
    setEnrolled(Boolean(result.data.isEnrolled));
    setProgress(Number(result.data.progress?.progressPercentage)||0);
    setNextLesson(result.data.progress?.nextLesson?._id||'');
   }
   if(request.success)setEnrollmentStatus(request.data||null);
  })();
  return()=>{active=false};
 },[id,isAuthenticated,isStudent]);
 const sections=useMemo(()=>Array.isArray(course?.sections)?course.sections.filter(x=>x&&typeof x==='object'&&typeof x.title==='string').sort((a,b)=>(a.order||0)-(b.order||0)):[],[course]);
 const lessonCount=sections.reduce((sum,sec)=>sum+(sec.lessons?.length||0),0);
 const duration=sections.reduce((sum,sec)=>sum+(sec.lessons?.reduce((n,l)=>n+(Number(l.completionTime)||0),0)||0),0);
 const instructor=course?.instructor?.name||'Course educator';
 const art=course?.thumbnail?.url;
 const hasArt=Boolean(art&&/^https:\/\//.test(art)&&!art.includes('res.cloudinary.com/demo'));
 const rating=Number(course?.averageRating||0);
 const enroll=async()=>{
  if(!isAuthenticated){router.push(`/login?redirect=${encodeURIComponent('/courses/'+id)}`);return;}
  if(!isStudent)return;
  setSubmitting(true);setError('');
  const result=await apiPost(`/courses/${encodeURIComponent(id)}/request-enroll`,{},true);
  if(result.success){setEnrollmentStatus('pending');router.push(`/enroll/waiting?course=${encodeURIComponent(id)}`);}
  else setError(result.error||'Your enrollment request could not be submitted.');
  setSubmitting(false);
 };
 const resume=()=>router.push(`/courses/${encodeURIComponent(id)}/learn${nextLesson?'?lesson='+encodeURIComponent(nextLesson):''}`);
 const action=()=>{
  if(enrolled)return <button type="button" className="ih-btn ih-btn-primary w-full" onClick={resume}><PlayCircleIcon className="h-5 w-5"/> {progress>0?'Continue learning':'Start learning'}</button>;
  if(enrollmentStatus==='pending')return <div className="bg-[#e8f3e8] rounded-xl px-5 py-4 text-sm text-[#347354] text-center font-semibold">Enrollment request awaiting approval</div>;
  if(!isStudent&&isAuthenticated)return <Link href="/dashboard" className="ih-btn ih-btn-primary w-full">Go to your workspace</Link>;
  return <button type="button" disabled={submitting||authLoading} onClick={()=>void enroll()} className="ih-btn ih-btn-primary w-full disabled:opacity-50">{submitting?'Requesting...':isAuthenticated?'Request enrollment':'Sign in to enroll'} <ArrowUpRightIcon className="w-5 h-5"/></button>;
 };
 return <div className="min-h-screen bg-[#f5f7f2]">
  <section className="bg-[#143e31] text-white py-12 lg:py-16"><div className="ih-container">
   <Link href="/courses" className="text-xs font-semibold text-[#bdd5bf] hover:text-white inline-flex items-center gap-2"><ArrowLeftIcon className="h-4 w-4"/> Course catalog</Link>
   <div className="lg:max-w-[730px] mt-9"><span className="inline-flex text-xs font-semibold rounded-full bg-white/10 text-[#cce9cf] px-3 py-1.5">{course?.category||'Online learning'}</span>
    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold !leading-[1.12] tracking-[-.05em] mt-5 !text-white">{course?.title||(loading?'Loading course...':'Course unavailable')}</h1>
    {course&&<><p className="mt-5 max-w-2xl text-[#c0d7c7] text-base leading-8">{course.description}</p>
    <div className="flex flex-wrap gap-x-6 gap-y-3 items-center mt-6 text-xs text-[#bcd3c2]"><span className="inline-flex gap-2 items-center"><AcademicCapIcon className="w-4 h-4"/>{course.level||'All levels'}</span><span className="inline-flex gap-2 items-center"><BookOpenIcon className="w-4 h-4"/>{sections.length} sections</span>{rating>0&&<span>★ {rating.toFixed(1)} learner rating</span>}</div></>}
   </div></div></section>
  <div className="ih-container py-10 lg:py-14">
   {loading?<div className="grid lg:grid-cols-[1fr_365px] gap-7"><div className="ih-skeleton h-[550px]"/><div className="ih-skeleton h-[450px]"/></div>:
   !course?<div className="ih-empty"><BookOpenIcon className="w-10 h-10 text-[#51966d]"/><h2 className="mt-5 text-xl font-bold">We couldn't find this course</h2><p role="alert" className="mt-2 text-sm ih-muted">{error}</p><button type="button" className="ih-btn ih-btn-primary mt-6" onClick={()=>setRetry(v=>v+1)}><ArrowPathIcon className="w-4 h-4"/>Try again</button></div>:
   <div className="grid lg:grid-cols-[minmax(0,1fr)_365px] gap-8 lg:gap-12 items-start">
    <div className="space-y-7">
     {error&&<p role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</p>}
     <section className="ih-card p-7 sm:p-9"><span className="ih-eyebrow">About this course</span><h2 className="text-2xl font-bold tracking-tight mt-4">What you'll learn.</h2><p className="text-sm leading-8 text-[#657b6a] mt-5 whitespace-pre-wrap">{course.description}</p></section>
     <section className="ih-card p-7 sm:p-9"><div className="flex flex-wrap gap-3 justify-between items-end"><div><span className="ih-eyebrow">Course curriculum</span><h2 className="text-2xl font-bold tracking-tight mt-4">Your learning path.</h2></div><p className="text-xs font-semibold text-[#799080]">{sections.length} sections · {lessonCount} lessons</p></div>
      {sections.length===0?<div className="mt-7 rounded-2xl bg-[#f3f7f0] p-7 text-sm text-[#708777]">The educator hasn't published an outline for this course yet.</div>:
       <div className="mt-7 divide-y divide-[#e5ece2] border border-[#e4ebe2] rounded-2xl overflow-hidden">{sections.map((section,index)=><div key={section._id}><button type="button" aria-expanded={openSection===section._id} onClick={()=>setOpenSection(v=>v===section._id?null:section._id)} className="w-full flex items-center justify-between gap-5 px-5 py-5 text-left bg-white hover:bg-[#f7faf6]"><span className="flex items-start gap-3"><span className="text-[#4e996e] text-xs font-bold pt-1">{String(index+1).padStart(2,'0')}</span><span><strong className="text-sm font-bold">{section.title}</strong><span className="block text-xs text-[#78917f] mt-1">{section.lessons?.length||0} lessons</span></span></span><ChevronDownIcon className={`h-4 w-4 text-[#597963] shrink-0 transition-transform ${openSection===section._id?'rotate-180':''}`}/></button>
       {openSection===section._id&&<div className="bg-[#f9fbf7] px-5 pb-4">{section.description&&<p className="text-xs leading-6 text-[#738979] pb-4">{section.description}</p>}{section.lessons?.length?<ul className="space-y-1">{section.lessons.map((lesson,j)=><li key={lesson._id} className="flex justify-between items-center gap-3 text-sm text-[#4e6856] py-3 border-t border-[#ecf1e9]"><span className="inline-flex gap-3 items-center"><PlayCircleIcon className="w-4 h-4 text-[#6aab7b]"/>{lesson.title}</span>{lesson.completionTime?<span className="text-xs text-[#849688] whitespace-nowrap">{lesson.completionTime} min</span>:null}</li>)}</ul>:<p className="text-xs ih-muted py-2">Lessons will appear here.</p>}</div>}
      </div>)}</div>}
     </section>
     <section className="ih-card p-7 sm:p-9"><span className="ih-eyebrow">Meet the educator</span><div className="flex flex-wrap gap-4 items-center mt-6"><div className="w-14 h-14 rounded-full bg-[#dceedd] grid place-items-center"><UserCircleIcon className="w-9 h-9 text-[#3e865c]"/></div><div><h2 className="font-bold text-lg">{instructor}</h2><p className="text-xs ih-muted mt-1">Course educator</p></div></div>{course.instructor?.bio&&<p className="text-sm leading-7 ih-muted mt-5">{course.instructor.bio}</p>}</section>
    </div>
    <aside className="ih-card overflow-hidden lg:sticky lg:top-24"><div className="relative aspect-[16/9] bg-[#d7eadb] overflow-hidden">{hasArt?<Image src={art!} alt="" fill unoptimized sizes="365px" className="object-cover"/>:<div className="absolute inset-0 flex flex-col justify-between p-6"><BookOpenIcon className="w-9 h-9 text-[#4a8967]"/><span className="text-2xl text-[#2f7652] font-extrabold tracking-tight">iremehub+</span></div>}</div>
     <div className="p-6"><div className="flex justify-between gap-3 items-center mb-6"><div><p className="text-xs ih-muted">Course access</p><p className="text-2xl font-bold tracking-tight mt-1">{course.price===0?'Free':'Paid course'}</p></div><span className="ih-badge">{course.level||'Learning'}</span></div>
      {action()}
      {canEdit&&<Link className="ih-btn ih-btn-neutral mt-3 w-full" href={`/dashboard/educator/courses/${id}/edit`}>Edit course</Link>}
      {enrolled&&<div className="mt-5"><div className="flex justify-between gap-2 text-xs text-[#62826b] font-semibold"><span>My progress</span><span>{Math.min(100,Math.max(0,Math.round(progress)))}%</span></div><div className="mt-2 h-2 bg-[#e7eee5] rounded-full overflow-hidden"><div className="h-full bg-[#4a9b6a] rounded-full" style={{width:`${Math.min(100,Math.max(0,progress))}%`}}/></div></div>}
      <div className="mt-6 border-t border-[#e7ece5] pt-5 space-y-3 text-sm text-[#617c68]"><div className="inline-flex gap-3 items-center"><CheckCircleIcon className="w-5 h-5 text-[#498963]"/>Self-paced learning</div><div className="flex gap-3 items-center"><BookOpenIcon className="w-5 h-5 text-[#498963]"/>{lessonCount} listed lessons</div><div className="inline-flex gap-3 items-center"><ClockIcon className="w-5 h-5 text-[#498963]"/>{duration>0?`${duration} estimated minutes`:'Learn at your pace'}</div><div className="flex gap-3 items-center"><LockClosedIcon className="w-5 h-5 text-[#498963]"/>Enrollment approval may be required</div></div>
     </div>
    </aside>
   </div>}
  </div>
 </div>;
}
