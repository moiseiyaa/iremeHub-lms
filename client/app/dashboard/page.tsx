'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AcademicCapIcon, ArrowUpRightIcon, BookOpenIcon, ChartBarIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { apiGet } from '../api/apiClient';
import CourseCard from '../../components/CourseCard';

interface Student { name: string; role: string; email: string }
interface Course {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: {url?: string};
  level?: string;
  category?: string;
  progress?: { completedLessons?: number | string[]; totalLessons?: number; percentage?: number; progressPercentage?: number; lastAccessedAt?: string };
}

export default function StudentDashboard(){
  const router=useRouter();
  const [user,setUser]=useState<Student|null>(null);
  const [courses,setCourses]=useState<Course[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');

  useEffect(()=>{
    let active=true;
    (async()=>{
      if(!window.localStorage.getItem('token')){router.replace('/login?redirect=%2Fdashboard');return;}
      const identity=await apiGet<Student>('/auth/me',true);
      if(!active)return;
      if(!identity.success||!identity.data){router.replace('/login?redirect=%2Fdashboard');return;}
      if(identity.data.role==='admin'){router.replace('/dashboard/admin');return;}
      if(identity.data.role==='educator'){router.replace('/dashboard/educator');return;}
      setUser(identity.data);
      const enrollment=await apiGet<Course[]>('/courses/my/enrolled',true);
      if(!active)return;
      if(enrollment.success&&Array.isArray(enrollment.data)){
        setCourses(enrollment.data.map(course=>({...course,progress:{...course.progress,percentage:Number(course.progress?.percentage??course.progress?.progressPercentage??0)}})));
      }else setError(enrollment.error||'We could not load your courses at the moment.');
      setLoading(false);
    })();
    return()=>{active=false};
  },[router]);
  const avg=useMemo(()=>courses.length?Math.round(courses.reduce((sum,c)=>sum+Math.min(100,Math.max(0,Number(c.progress?.percentage)||0)),0)/courses.length):0,[courses]);
  const completed=useMemo(()=>courses.filter(c=>(Number(c.progress?.percentage)||0)>=100).length,[courses]);

  if(loading)return <div className="ih-container py-24" aria-label="Loading your learning workspace"><div className="ih-skeleton h-40 max-w-3xl mb-8"/><div className="grid lg:grid-cols-2 gap-6"><div className="ih-skeleton h-60"/><div className="ih-skeleton h-60"/></div></div>;
  return <div className="pb-20">
    <section className="bg-[#143f31] text-white pt-14 pb-20 lg:pt-20 lg:pb-24">
      <div className="ih-container flex flex-wrap justify-between gap-7 items-end">
        <div><span className="text-xs font-bold uppercase tracking-[.14em] text-[#b6d3bf]">Your learning space</span><h1 className="text-4xl sm:text-5xl font-bold tracking-[-.055em] mt-5 !text-white">Welcome back, {user?.name?.split(' ')[0]||'learner'}.</h1><p className="mt-4 text-[#c2d7c6]">A little progress today can make a big difference tomorrow.</p></div>
        <Link href="/courses" className="ih-btn ih-btn-lime">Explore courses <ArrowUpRightIcon className="h-5 w-5"/></Link>
      </div>
    </section>
    <div className="ih-container -mt-10 relative z-10">
      <div className="grid md:grid-cols-3 gap-4">
        {[{icon:BookOpenIcon,label:'Enrolled courses',value:courses.length},{icon:ChartBarIcon,label:'Average progress',value:`${avg}%`},{icon:CheckBadgeIcon,label:'Courses completed',value:completed}].map(item=><div key={item.label} className="ih-card px-6 py-6 flex gap-4 items-center"><div className="rounded-2xl bg-[#e9f3e9] h-13 w-13 p-3"><item.icon className="w-7 h-7 text-[#267552]"/></div><div><p className="text-xs text-[#748779] font-semibold">{item.label}</p><p className="mt-1 text-3xl font-extrabold tracking-tight">{item.value}</p></div></div>)}
      </div>
      <div className="grid lg:grid-cols-[1.6fr_.7fr] gap-7 mt-10 items-start">
        <section><div className="flex gap-4 justify-between items-end mb-6"><div><span className="ih-eyebrow">Continue learning</span><h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">Your courses</h2></div><Link href="/courses" className="text-sm font-bold text-[#29744f] hover:underline">Browse all</Link></div>
          {error&&<p role="alert" className="border border-red-200 bg-red-50 text-red-800 rounded-2xl p-4 mb-5">{error}</p>}
          {courses.length>0?<div className="space-y-4">{courses.map(course=><CourseCard key={course._id} course={course}/>)}</div>:<div className="ih-empty"><AcademicCapIcon className="h-11 w-11 text-[#3e9061]"/><h3 className="mt-4 font-bold text-xl">Your learning journey starts here</h3><p className="mt-2 text-sm ih-muted max-w-sm">When you join a course, it will appear in this workspace.</p><Link href="/courses" className="ih-btn ih-btn-primary mt-5">Explore courses</Link></div>}
        </section>
        <aside className="ih-card p-7 lg:sticky lg:top-24"><h2 className="text-lg font-bold tracking-tight">Quick access</h2><p className="text-sm ih-muted mt-2 mb-6">Everything you need, close at hand.</p><div className="space-y-3">{[{label:'Your certificates',href:'/certificates',icon:CheckBadgeIcon},{label:'Personal profile',href:'/profile',icon:AcademicCapIcon},{label:'Explore courses',href:'/courses',icon:BookOpenIcon}].map(link=><Link key={link.href} href={link.href} className="flex items-center justify-between gap-2 rounded-xl border border-[#e3eae1] px-4 py-3 hover:bg-[#f2f8f1]"><span className="inline-flex items-center gap-3 text-sm font-semibold"><link.icon className="w-5 h-5 text-[#3d8460]"/>{link.label}</span><ArrowUpRightIcon className="w-4 h-4 text-[#5a8c6c]"/></Link>)}</div></aside>
      </div>
    </div>
  </div>;
}
