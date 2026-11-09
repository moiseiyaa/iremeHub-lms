'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon, BookOpenIcon, CheckCircleIcon, CloudArrowUpIcon, EyeIcon,
  PencilSquareIcon, PhotoIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { apiGet, apiPost, apiPut } from '../../app/api/apiClient';
import CurriculumManager from './CurriculumManager';

interface CourseRecord {
  _id:string;title:string;description:string;category:string;level:string;price:number;isPublished:boolean;
  thumbnail?:{url?:string}
}
interface CourseDraft {title:string;description:string;category:string;level:string;price:string;isPublished:boolean}
const categories=['Web Development','Mobile Development','Data Science','Machine Learning','AI','Business','Marketing','IT & Software','Personal Development','Design','Photography','Music','Other'];
const levels=['Beginner','Intermediate','Advanced'];
const blank:CourseDraft={title:'',description:'',category:'Web Development',level:'Beginner',price:'0',isPublished:false};

export default function CourseEditor({courseId}:{courseId?:string}){
  const router=useRouter();
  const isEdit=Boolean(courseId);
  const [draft,setDraft]=useState<CourseDraft>(blank);
  const [loading,setLoading]=useState(Boolean(courseId));
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const [saved,setSaved]=useState('');
  const [photo,setPhoto]=useState<File|null>(null);
  const [existingPhoto,setExistingPhoto]=useState('');
  const [photoPreview,setPhotoPreview]=useState('');
  const [activeTab,setActiveTab]=useState<'details'|'curriculum'>('details');

  useEffect(()=>{
    if(!courseId)return;
    let active=true;
    (async()=>{
      setLoading(true);setError('');
      const response=await apiGet<CourseRecord>(`/courses/${encodeURIComponent(courseId)}/manage`,true);
      if(!active)return;
      if(response.success && response.data){
        const c=response.data;
        setDraft({title:c.title||'',description:c.description||'',category:c.category||'Other',level:c.level||'Beginner',price:String(c.price??0),isPublished:Boolean(c.isPublished)});
        setExistingPhoto(c.thumbnail?.url||'');
      }else setError(response.error||'Unable to load this course.');
      setLoading(false);
    })();
    return()=>{active=false;};
  },[courseId]);

  useEffect(()=>{
    if(!photo){setPhotoPreview('');return;}
    const url=URL.createObjectURL(photo);
    setPhotoPreview(url);
    return()=>URL.revokeObjectURL(url);
  },[photo]);

  const change=(field:keyof CourseDraft,value:string|boolean)=>{
    setSaved('');setDraft(v=>({...v,[field]:value}));
  };

  const selectPhoto=(event:ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0]||null;
    if(!file){setPhoto(null);return;}
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){
      setError('Choose a PNG, JPEG or WebP image.');event.target.value='';return;
    }
    if(file.size>900_000){
      setError('Keep course cover images under 900 KB.');event.target.value='';return;
    }
    setError('');setPhoto(file);
  };

  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();setError('');setSaved('');
    if(draft.title.trim().length<5){setError('Course title must contain at least five characters.');return;}
    if(draft.description.trim().length<20){setError('Add a course description of at least 20 characters.');return;}
    const price=Number(draft.price);
    if(!Number.isFinite(price)||price<0){setError('Enter a valid non-negative course price.');return;}
    setSaving(true);
    const payload={
      title:draft.title.trim(),description:draft.description.trim(),category:draft.category,
      level:draft.level,price,isPublished:draft.isPublished
    };
    const result=isEdit
      ? await apiPut<CourseRecord>(`/courses/${encodeURIComponent(courseId!) }`,payload,true)
      : await apiPost<CourseRecord>('/courses',payload,true);

    if(!result.success || !result.data?._id){
      setError(result.error||'Could not save the course.');setSaving(false);return;
    }
    const id=result.data._id;
    if(photo){
      const upload=new FormData();upload.append('thumbnail',photo);
      const imageResult=await apiPut<CourseRecord>(`/courses/${encodeURIComponent(id)}/thumbnail`,upload,true);
      if(!imageResult.success){
        setSaved('Your course details were saved.');
        setError(imageResult.error||'The cover image could not be uploaded. Select another image and retry.');
        setSaving(false);
        if(!isEdit)router.push(`/dashboard/educator/courses/${encodeURIComponent(id)}/edit`);
        return;
      }
      setPhoto(null);setExistingPhoto(imageResult.data?.thumbnail?.url||'');
    }
    setSaving(false);setSaved('Course saved successfully.');
    if(!isEdit)router.push(`/dashboard/educator/courses/${encodeURIComponent(id)}/edit`);
  };

  const artwork=photoPreview || (existingPhoto && !existingPhoto.includes('res.cloudinary.com/demo') ? existingPhoto : '');
  const isValidArtwork=Boolean(artwork && (artwork.startsWith('blob:')||/^https:\/\//.test(artwork)));
  return <div className="bg-[#f5f7f2] min-h-screen py-10 lg:py-14"><div className="ih-container max-w-[1150px]">
    <div className="flex flex-wrap justify-between items-end gap-6 mb-8">
      <div>
        <Link href="/dashboard/educator/courses" className="inline-flex items-center gap-2 text-sm text-[#2e7753] font-bold"><ArrowLeftIcon className="w-4 h-4"/> All courses</Link>
        <span className="ih-eyebrow !flex mt-6">Educator studio</span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-.06em] mt-4">{isEdit?'Design your course.':'Create something worth learning.'}</h1>
        <p className="ih-muted text-sm leading-7 mt-4 max-w-2xl">Shape clear lessons and build an engaging curriculum in the iremehub+ learning studio.</p>
      </div>
      <span className="ih-badge">{isEdit ? 'Course workspace' : 'New course'}</span>
    </div>

    {isEdit&&<div role="tablist" aria-label="Course editor sections" className="flex gap-2 border-b border-[#dce7db] mb-8">
      {([{key:'details',label:'Course details',icon:PencilSquareIcon},{key:'curriculum',label:'Curriculum',icon:BookOpenIcon}] as const).map(tab=>
      <button type="button" role="tab" key={tab.key} aria-selected={activeTab===tab.key}
        className={`px-5 py-4 text-sm font-bold border-b-2 inline-flex items-center gap-2 ${activeTab===tab.key?'border-[#227851] text-[#206b48]':'border-transparent text-[#809282]'}`}
        onClick={()=>setActiveTab(tab.key)}><tab.icon className="w-5 h-5"/>{tab.label}</button>)}
    </div>}

    {isEdit&&activeTab==='curriculum'?<CurriculumManager courseId={courseId!}/>:
    <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-7 lg:gap-10 items-start">
      <div className="ih-card p-7 sm:p-9">
        <div className="mb-8"><h2 className="text-xl font-bold">Course information</h2><p className="ih-muted text-sm mt-2">Essential details shown to prospective learners.</p></div>
        {loading?<div className="space-y-5" aria-label="Loading course editor">{[1,2,3,4].map(i=><div className="ih-skeleton h-16" key={i}/>)}</div>:
        <form onSubmit={e=>void submit(e)} className="space-y-6">
          <div><label htmlFor="course-title" className="ih-form-label">Course title *</label><input id="course-title" className="ih-input" minLength={5} maxLength={100} required placeholder="Give your course an inspiring title" value={draft.title} onChange={e=>change('title',e.target.value)}/><p className="text-xs ih-muted mt-2">{draft.title.length}/100 characters</p></div>
          <div><label htmlFor="course-description" className="ih-form-label">Course description *</label><textarea id="course-description" className="ih-input !min-h-[195px] leading-7" minLength={20} maxLength={2000} required value={draft.description} onChange={e=>change('description',e.target.value)} placeholder="What will participants learn, and why does it matter?"/><p className="text-xs ih-muted mt-2">{draft.description.length}/2000 characters</p></div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div><label htmlFor="course-category" className="ih-form-label">Category</label><select id="course-category" className="ih-input" value={draft.category} onChange={e=>change('category',e.target.value)}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div><label htmlFor="course-level" className="ih-form-label">Learning level</label><select id="course-level" className="ih-input" value={draft.level} onChange={e=>change('level',e.target.value)}>{levels.map(l=><option key={l} value={l}>{l}</option>)}</select></div>
          </div>
          <div><label htmlFor="course-price" className="ih-form-label">Price (legacy numeric value)</label><input id="course-price" className="ih-input" type="number" min="0" step=".01" required value={draft.price} onChange={e=>change('price',e.target.value)}/><p className="text-xs ih-muted mt-2">Enter 0 for a free course. Currency, checkout and paid entitlements require billing integration; publishing is not proof of purchasable access.</p></div>
          <div><span className="ih-form-label">Cover image</span><label className="flex flex-col items-center justify-center cursor-pointer min-h-[140px] rounded-2xl border-2 border-dashed border-[#c3d9c5] bg-[#f7faf5] text-center px-6 py-7 hover:bg-[#eff6ec]"><PhotoIcon className="w-9 h-9 text-[#4c956a]"/><span className="mt-4 text-sm font-bold text-[#2e6e4d]">Choose a course cover</span><span className="text-xs ih-muted mt-2">PNG, JPEG or WebP · Under 900 KB</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={selectPhoto} className="sr-only"/></label>{photo&&<p className="mt-2 text-xs text-[#37835d] font-semibold">{photo.name} selected</p>}</div>
          <label className="rounded-2xl border border-[#dfe8db] p-5 flex justify-between items-center gap-5 cursor-pointer"><span><strong className="block text-sm">Publish to the catalog</strong><span className="text-xs text-[#708575] leading-6 mt-1 block">Published courses become publicly discoverable. Keep drafts private while preparing content.</span></span><input type="checkbox" className="w-5 h-5 accent-[#19654e] shrink-0" checked={draft.isPublished} onChange={e=>change('isPublished',e.target.checked)}/></label>
          {error&&<p role="alert" className="bg-[#fff5f0] text-[#973d37] border border-[#f3d3c8] rounded-xl p-4 text-sm">{error}</p>}
          {saved&&<p role="status" className="bg-[#ebf6e9] border border-[#bbdcc3] text-[#327652] rounded-xl p-4 text-sm inline-flex items-center gap-2"><CheckCircleIcon className="h-5 w-5"/>{saved}</p>}
          <div className="flex flex-wrap gap-3 justify-end border-t border-[#e5ece3] pt-6"><Link href="/dashboard/educator/courses" className="ih-btn ih-btn-neutral">Back to courses</Link><button type="submit" disabled={saving} className="ih-btn ih-btn-primary disabled:opacity-50">{saving?'Saving...':isEdit?'Save course changes':'Create course'}<CheckCircleIcon className="w-5 h-5"/></button></div>
        </form>}
      </div>
      <aside className="space-y-5 lg:sticky lg:top-24">
        <div className="ih-card overflow-hidden"><div className="relative aspect-[16/10] bg-[#d7ead8]">{isValidArtwork?<Image src={artwork} fill unoptimized sizes="330px" alt="Course cover preview" className="object-cover"/>:<div className="p-7 absolute inset-0 flex flex-col justify-between"><BookOpenIcon className="w-9 h-9 text-[#3b7953]"/><span className="font-extrabold tracking-[-.055em] text-2xl text-[#36714f]">iremehub+</span></div>}</div>
          <div className="p-6"><span className="ih-badge">{draft.isPublished?'Published':'Draft preview'}</span><h2 className="font-bold tracking-tight text-lg mt-4 break-words">{draft.title.trim()||'Your course title'}</h2><p className="text-sm text-[#718475] leading-6 mt-3 line-clamp-3">{draft.description.trim()||'Learners will see your course description here.'}</p><div className="border-t border-[#e6ece4] mt-5 pt-4 flex justify-between text-xs font-semibold text-[#4e7657]"><span>{draft.category}</span><span>{draft.level}</span></div></div>
        </div>
        <div className="bg-[#e5f2e6] rounded-2xl p-6"><span className="inline-flex items-center gap-2 font-bold text-sm"><ShieldCheckIcon className="w-5 h-5 text-[#2d8052]"/> Authoring workflow</span><p className="text-sm leading-7 text-[#597663] mt-3">{isEdit?'Use the Curriculum tab to organize sections and add lessons.':'Create the course first, then build sections and lessons in the Curriculum tab.'}</p></div>
      </aside>
    </div>}
  </div></div>;
}
