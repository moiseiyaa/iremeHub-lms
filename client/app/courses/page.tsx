'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpenIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { apiGet } from '../api/apiClient';
import CourseFilters, { CatalogFilters } from '../../components/CourseFilters';
import LiveCourseCard, { CatalogCourse } from '../../components/LiveCourseCard';

export default function CoursesPage() {
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<CatalogFilters>({category:'',level:'',price:''});
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError('');
      const response = await apiGet<CatalogCourse[]>('/courses');
      if (!mounted) return;
      if (response.success && Array.isArray(response.data)) setCourses(response.data);
      else { setCourses([]); setError(response.error || 'The course catalog is currently unavailable.'); }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [refresh]);

  const categories = useMemo(() => [...new Set(courses.map(course=>course.category).filter((item):item is string=>!!item))].sort(),[courses]);
  const visible = useMemo(()=>courses.filter(course=>{
    const text = [course.title,course.description || '',course.category || ''].join(' ').toLowerCase();
    return text.includes(query.trim().toLowerCase())
      && (!filters.category || course.category===filters.category)
      && (!filters.level || course.level?.toLowerCase()===filters.level.toLowerCase())
      && (!filters.price || (filters.price==='free'?Number(course.price)===0:Number(course.price)>0));
  }),[courses,query,filters]);
  const changeFilter = (key:keyof CatalogFilters,value:string)=>setFilters(current=>({...current,[key]:value}));
  const clear=()=>{setQuery('');setFilters({category:'',level:'',price:''});};

  return <div className="bg-[#f5f7f2] min-h-screen">
    <header className="bg-[#113c2f] text-white py-16 lg:py-20">
      <div className="ih-container"><span className="ih-eyebrow !text-[#c8e8cc]">Explore learning</span><h1 className="ih-heading !text-[clamp(2.6rem,5vw,4.5rem)] mt-5">Find what moves you forward.</h1><p className="text-[#b6d0c0] text-base md:text-lg leading-8 max-w-2xl mt-5">Discover courses and practical lessons from our published catalog. Learn at your own pace, wherever you are.</p></div>
    </header>
    <div className="ih-container py-12 lg:py-16">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-7"><div><h2 className="text-2xl font-bold tracking-tight">Course catalog</h2><p className="text-sm text-[#74877a] mt-1">{loading?'Finding courses...':`${visible.length} ${visible.length===1?'course':'courses'} available`}</p></div><Link href="/dashboard" className="ih-btn ih-btn-neutral">My learning</Link></div>
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] items-start">
        <CourseFilters query={query} filters={filters} categories={categories} onSearch={setQuery} onFilterChange={changeFilter} onClearAll={clear}/>
        <div>
          {loading ? <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5" aria-label="Loading courses">{[1,2,3,4,5,6].map(n=><div key={n} className="ih-skeleton h-[330px]"/>)}</div> :
            error ? <div className="ih-empty"><BookOpenIcon className="w-11 h-11 text-[#4f956c]"/><h3 className="text-xl font-bold mt-4">Couldn’t load courses</h3><p role="alert" className="ih-muted mt-2 text-sm max-w-sm">{error}</p><button className="ih-btn ih-btn-primary mt-6" type="button" onClick={()=>setRefresh(x=>x+1)}><ArrowPathIcon className="h-5 w-5"/> Try again</button></div> :
            visible.length===0 ? <div className="ih-empty"><BookOpenIcon className="w-11 h-11 text-[#4f956c]"/><h3 className="text-xl font-bold mt-4">Nothing matches just yet</h3><p className="ih-muted mt-2 text-sm max-w-sm">{courses.length===0?'There are no published courses at the moment.':'Try a different search or remove a filter.'}</p><button type="button" className="ih-btn ih-btn-neutral mt-6" onClick={clear}>Clear filters</button></div> :
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">{visible.map(course=><LiveCourseCard key={course._id} course={course}/>)}</div>}
        </div>
      </div>
    </div>
  </div>;
}
