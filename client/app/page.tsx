'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRightIcon, BookOpenIcon, BuildingOffice2Icon, ChartBarSquareIcon, PlayCircleIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { apiGet } from './api/apiClient';
import LiveCourseCard from '../components/LiveCourseCard';

interface FeaturedCourse {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: { url?: string };
  price?: number;
  level?: string;
  category?: string;
}

const roles = [
  { icon: BuildingOffice2Icon, title: 'For institutions', description: 'Bring your learning programs, educators and learners together in one organized space.', detail: 'Organize learning' },
  { icon: BookOpenIcon, title: 'For educators', description: 'Create structured courses, guide learners and understand how learning progresses.', detail: 'Create with clarity' },
  { icon: UserGroupIcon, title: 'For learners', description: 'Find your next lesson, stay on track and turn every milestone into progress.', detail: 'Keep moving' },
];

export default function Home() {
  const [courses, setCourses] = useState<FeaturedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      const response = await apiGet<FeaturedCourse[]>('/courses');
      if (!active) return;
      setCourses(response.success && Array.isArray(response.data) ? response.data.slice(0, 3) : []);
      setError(!response.success);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="overflow-hidden">
      <section className="relative bg-[#f5f7f2] pt-14 pb-20 lg:pt-20 lg:pb-28">
        <div className="ih-container grid lg:grid-cols-[.97fr_1.03fr] items-center gap-12 xl:gap-20">
          <div className="relative z-10">
            <span className="ih-eyebrow">A new way to make learning matter</span>
            <h1 className="ih-display mt-7 max-w-[730px] text-[#133a2c]">Your world of learning, <span className="text-[#3c8965]">connected.</span></h1>
            <p className="ih-lead mt-7">A thoughtful digital learning space for institutions, educators and learners. Build the next chapter with the tools, clarity and support that great learning deserves.</p>
            <div className="flex flex-wrap gap-3 mt-9">
              <Link href="/courses" className="ih-btn ih-btn-primary">Explore courses <ArrowUpRightIcon className="w-5 h-5" /></Link>
              <Link href="/about" className="ih-btn ih-btn-neutral">Discover the platform</Link>
            </div>
            <div className="mt-12 pt-6 border-t border-[#d8e4d8] flex flex-wrap items-center gap-4">
              <div className="flex -space-x-3" aria-hidden="true">{['S', 'E', 'I'].map((label, index) => <div key={label} className={`grid h-11 w-11 place-items-center rounded-full border-2 border-[#f5f7f2] text-sm font-bold ${index === 0 ? 'bg-[#d8f59d]' : index === 1 ? 'bg-[#cfe4db]' : 'bg-[#e9ded2]'}`}>{label}</div>)}</div>
              <p className="text-sm text-[#5d7367]">One experience for <strong className="text-[#193a2d]">students, educators and institutions</strong></p>
            </div>
          </div>
          <div className="ih-hero-visual relative p-5 sm:p-7 lg:p-9" aria-label="Illustrative learning workspace preview">
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-[#d8f59d] opacity-70 blur-[3px]" aria-hidden="true" />
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-[#fbfcf8] text-[#19382c] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#e6ece4] px-5 py-4">
                <div className="flex items-center gap-2 font-extrabold tracking-[-.06em] text-lg"><span className="inline-grid h-7 w-7 place-items-center rounded-lg bg-[#1a674e] text-white text-sm">i+</span> iremehub<span className="text-[#329266]">+</span></div>
                <span className="text-[10px] font-semibold tracking-[.12em] uppercase text-[#799187]">Workspace concept</span>
              </div>
              <div className="grid grid-cols-[68px_1fr] sm:grid-cols-[104px_1fr] min-h-[365px]">
                <div className="bg-[#f0f4ee] p-3 sm:p-4 flex flex-col gap-5 border-r border-[#e0e9de]">
                  {['▦','◈','▤','◷'].map((symbol,index)=><span key={index} className={`h-9 rounded-lg grid place-items-center ${index===0?'bg-[#d4ebd8] text-[#226c4f]':'text-[#a0b3a6]'}`} aria-hidden="true">{symbol}</span>)}
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold tracking-[.14em] uppercase text-[#759084]">Learning overview</p><h2 className="mt-1 font-bold text-lg sm:text-xl tracking-tight">Keep your momentum.</h2></div><span className="h-9 w-9 grid place-items-center rounded-full bg-[#d8f59d] text-sm font-bold">L</span></div>
                  <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="rounded-xl bg-[#e5f1e6] p-3 sm:p-4"><BookOpenIcon className="w-5 h-5 text-[#2b7152]" /><p className="mt-4 text-xs text-[#52745e]">Your courses</p><p className="text-sm font-bold">In one place</p></div>
                    <div className="rounded-xl bg-[#f4eedd] p-3 sm:p-4"><ChartBarSquareIcon className="w-5 h-5 text-[#957e47]" /><p className="mt-4 text-xs text-[#7b7055]">Learning goals</p><p className="text-sm font-bold">Track progress</p></div>
                  </div>
                  <div className="mt-5 rounded-xl border border-[#e0e8df] bg-white px-4 py-4">
                    <p className="text-xs text-[#73897a]">Continue where you left off</p>
                    <div className="mt-3 flex items-center gap-3"><div className="h-11 w-11 rounded-lg grid place-items-center bg-[#d9e8da]"><PlayCircleIcon className="w-6 h-6 text-[#2a7455]" /></div><div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">Your next lesson</p><p className="text-xs text-[#81928a]">Your learning path</p></div><span className="text-[#2a7455]" aria-hidden="true">↗</span></div>
                    <div className="h-1.5 mt-4 bg-[#e9efe7] rounded-full"><div className="w-[58%] bg-[#6caf80] h-full rounded-full" /></div>
                  </div>
                  <p className="mt-3 text-[10px] text-[#87968c]">Illustrative interface · Not live learner data</p>
                </div>
              </div>
            </div>
            <div className="relative mt-6 text-xs text-[#a9c6b6] flex justify-between gap-4"><span>Built around people.</span><span>Designed for progress. ✳</span></div>
          </div>
        </div>
      </section>

      <section className="ih-section bg-white">
        <div className="ih-container">
          <div className="flex flex-wrap justify-between items-end gap-7 mb-11">
            <div><span className="ih-eyebrow">Made for every role</span><h2 className="ih-heading mt-5 max-w-2xl">A better experience for everyone involved.</h2></div>
            <p className="ih-lead !text-base max-w-sm">Simple where it should be. Powerful where it matters.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">{roles.map((item,index)=><article key={item.title} className={`rounded-[24px] p-7 sm:p-8 min-h-[290px] flex flex-col ${index===0?'bg-[#e8f2e9]':index===1?'bg-[#f0f3e9]':'bg-[#f8f4ec]'}`}><div className="h-13 w-13 rounded-2xl bg-white/80 inline-flex items-center justify-center p-3 w-fit"><item.icon className="w-7 h-7 text-[#1b6a4f]"/></div><h3 className="mt-9 text-2xl font-bold tracking-[-.04em]">{item.title}</h3><p className="text-[#607369] leading-7 text-sm mt-3 flex-1">{item.description}</p><span className="mt-7 font-semibold text-sm text-[#216c50]">{item.detail}</span></article>)}</div>
        </div>
      </section>

      <section className="ih-section bg-[#f5f7f2]">
        <div className="ih-container">
          <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
            <div><span className="ih-eyebrow">Explore what is available</span><h2 className="ih-heading mt-5">Explore courses.</h2><p className="ih-lead !text-base mt-3">Discover published courses directly from our catalog.</p></div>
            <Link href="/courses" className="ih-btn ih-btn-neutral">View catalog <ArrowUpRightIcon className="w-5 h-5"/></Link>
          </div>
          {loading ? <div className="grid gap-6 md:grid-cols-3" aria-label="Loading courses">{[0,1,2].map(i=><div key={i} className="ih-skeleton h-[340px]"/>)}</div> :
            courses.length > 0 ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{courses.map((course,index)=><LiveCourseCard key={course._id} course={course} featured={index===0}/>)}</div> :
            <div className="ih-empty"><BookOpenIcon className="h-10 w-10 text-[#55936e]"/><h3 className="text-xl font-bold mt-5">Courses are on their way</h3><p className="ih-muted text-sm mt-2 max-w-md">{error?'The catalog is temporarily unavailable. Please check again later.':'No published courses are available at the moment.'}</p><Link className="ih-btn ih-btn-neutral mt-6" href="/about">Learn about iremehub+</Link></div>}
        </div>
      </section>

      <section className="bg-[#113d2f] text-white py-16 lg:py-24">
        <div className="ih-container grid lg:grid-cols-[1.3fr_auto] items-center gap-8">
          <div><span className="text-xs uppercase tracking-[.16em] text-[#b6d7bc] font-bold">Build what comes next</span><h2 className="mt-5 text-3xl sm:text-5xl max-w-3xl font-bold tracking-[-.05em] leading-tight">Learning that grows with your ambitions.</h2><p className="mt-4 text-[#b7d0c0] max-w-xl leading-7">Explore how iremehub+ is evolving to support learning communities of every size.</p></div>
          <div><Link href="/contact" className="ih-btn ih-btn-lime">Get in touch <ArrowUpRightIcon className="h-5 w-5"/></Link></div>
        </div>
      </section>
    </div>
  );
}
