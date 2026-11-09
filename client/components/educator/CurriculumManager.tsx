'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../app/api/apiClient';
import {
  BookOpenIcon, ChevronDownIcon, CheckCircleIcon, PlusIcon, PencilSquareIcon,
  TrashIcon, DocumentTextIcon, PlayCircleIcon, ClipboardDocumentListIcon, ListBulletIcon
} from '@heroicons/react/24/outline';

interface Section {_id:string;title:string;description?:string;order?:number}
type LessonType='text'|'youtube'|'assignment'|'quiz'|'exam';
interface Question {question:string;options:string[];correctAnswer:number;points:number}
interface LessonContent {
  textContent?:string;youtubeUrl?:string;youtubeVideoId?:string;
  assignmentInstructions?:string;quizQuestions?:Question[];examQuestions?:Question[];
  examDuration?:number;passingScore?:number
}
interface Lesson {
  _id:string;title:string;description:string;contentType:string;content:LessonContent;
  section?:{_id:string;title?:string}|string|null;isPreview?:boolean;order?:number;completionTime?:number
}
interface LessonDraft {
  title:string;description:string;section:string;contentType:LessonType;
  contentText:string;youtubeUrl:string;completionTime:string;isPreview:boolean;
  questions:Question[];examDuration:string;passingScore:string
}
const blankQuestion=():Question=>({question:'',options:['','','',''],correctAnswer:0,points:1});
const newLesson=(section=''):LessonDraft=>({
  title:'',description:'',section,contentType:'text',contentText:'',youtubeUrl:'',completionTime:'15',
  isPreview:false,questions:[blankQuestion()],examDuration:'60',passingScore:'85'
});
const validTypes:LessonType[]=['text','youtube','assignment','quiz','exam'];
const lessonIcon=(kind:string)=>kind==='youtube'?PlayCircleIcon:kind==='quiz'||kind==='exam'?ClipboardDocumentListIcon:DocumentTextIcon;

export default function CurriculumManager({courseId}:{courseId:string}){
  const [sections,setSections]=useState<Section[]>([]);
  const [lessons,setLessons]=useState<Lesson[]>([]);
  const [loading,setLoading]=useState(true);const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);const [notice,setNotice]=useState('');
  const [openSection,setOpenSection]=useState<string|null>(null);
  const [sectionForm,setSectionForm]=useState({title:'',description:''});
  const [editingSection,setEditingSection]=useState<string|null>(null);
  const [showSectionForm,setShowSectionForm]=useState(false);
  const [showLessonForm,setShowLessonForm]=useState(false);
  const [editingLesson,setEditingLesson]=useState<string|null>(null);
  const [lessonForm,setLessonForm]=useState<LessonDraft>(newLesson());
  const [version,setVersion]=useState(0);

  useEffect(()=>{
    if(!courseId)return;
    let active=true;
    (async()=>{
      setLoading(true);setError('');
      const [a,b]=await Promise.all([
        apiGet<Section[]>(`/courses/${encodeURIComponent(courseId)}/sections`,true),
        apiGet<Lesson[]>(`/courses/${encodeURIComponent(courseId)}/lessons`,true)
      ]);
      if(!active)return;
      if(a.success&&Array.isArray(a.data)){
        setSections([...a.data].sort((x,y)=>(x.order||0)-(y.order||0)));
        setOpenSection(current=>current??a.data?.[0]?._id??null);
      }else setError(a.error||'Course sections could not be loaded.');
      if(b.success&&Array.isArray(b.data))setLessons(b.data);
      else setError(current=>[current,b.error||'Course lessons could not be loaded.'].filter(Boolean).join(' '));
      setLoading(false);
    })();
    return()=>{active=false};
  },[courseId,version]);

  const grouped=useMemo(()=>{
    const map=new Map<string,Lesson[]>();
    for(const lesson of lessons){
      const sectionId=typeof lesson.section==='string'?lesson.section:lesson.section?._id||'unassigned';
      const group=map.get(sectionId)||[];group.push(lesson);map.set(sectionId,group);
    }
    for(const group of map.values())group.sort((a,b)=>(a.order||0)-(b.order||0));
    return map;
  },[lessons]);

  const resetError=()=>{setError('');setNotice('')};
  const createSection=()=>{
    resetError();setEditingSection(null);setSectionForm({title:'',description:''});setShowSectionForm(true);
  };
  const editSection=(section:Section)=>{
    resetError();setEditingSection(section._id);setSectionForm({title:section.title,description:section.description||''});setShowSectionForm(true);
  };
  const saveSection=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();resetError();
    if(sectionForm.title.trim().length<3){setError('Section title should contain at least three characters.');return;}
    setSaving(true);
    const payload={title:sectionForm.title.trim(),description:sectionForm.description.trim()};
    const response=editingSection
      ?await apiPut<Section>(`/courses/${encodeURIComponent(courseId)}/sections/${encodeURIComponent(editingSection)}`,payload,true)
      :await apiPost<Section>(`/courses/${encodeURIComponent(courseId)}/sections`,payload,true);
    if(response.success){
      setShowSectionForm(false);setNotice('Section saved.');
      if(response.data?._id)setOpenSection(response.data._id);
      setVersion(v=>v+1);
    }else setError(response.error||'Could not save the section.');
    setSaving(false);
  };
  const deleteSection=async(section:Section)=>{
    const count=grouped.get(section._id)?.length||0;
    if(count){setError('Move or delete the lessons in this section before deleting the section.');return;}
    if(!window.confirm(`Delete section "${section.title}"?`))return;
    resetError();
    const result=await apiDelete(`/courses/${encodeURIComponent(courseId)}/sections/${encodeURIComponent(section._id)}`,true);
    if(result.success){setVersion(v=>v+1);setNotice('Section deleted.');}
    else setError(result.error||'Unable to delete the section.');
  };

  const createLesson=(sectionId:string)=>{
    resetError();setEditingLesson(null);setLessonForm(newLesson(sectionId));setShowLessonForm(true);
  };
  const editLesson=(lesson:Lesson)=>{
    resetError();setEditingLesson(lesson._id);
    const content=lesson.content||{};
    const type=validTypes.includes(lesson.contentType as LessonType)?lesson.contentType as LessonType:'text';
    const questions=(type==='quiz'?content.quizQuestions:content.examQuestions)||[blankQuestion()];
    setLessonForm({
      title:lesson.title,description:lesson.description||'',contentType:type,
      section:typeof lesson.section==='string'?lesson.section:lesson.section?._id||'',
      contentText:type==='assignment'?content.assignmentInstructions||'':content.textContent||'',
      youtubeUrl:content.youtubeUrl||'',
      completionTime:String(lesson.completionTime||15),isPreview:Boolean(lesson.isPreview),
      questions:questions.map(q=>({question:q.question||'',options:[...q.options],correctAnswer:q.correctAnswer||0,points:q.points||1})),
      examDuration:String(content.examDuration||60),passingScore:String(content.passingScore||85)
    });
    setShowLessonForm(true);
  };
  const changeLesson=(key:keyof LessonDraft,value:string|boolean)=>setLessonForm(d=>({...d,[key]:value}));
  const changeQuestion=(index:number,change:Partial<Question>)=>setLessonForm(d=>({...d,questions:d.questions.map((q,i)=>i===index?{...q,...change}:q)}));

  const saveLesson=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();resetError();
    if(!lessonForm.section){setError('Choose a curriculum section before saving a lesson.');return;}
    if(lessonForm.title.trim().length<3 || lessonForm.description.trim().length<5){setError('Add a descriptive title and a short lesson description.');return;}
    const type=lessonForm.contentType;
    const content:LessonContent={};
    if(type==='text'){content.textContent=lessonForm.contentText.trim();}
    if(type==='assignment'){content.assignmentInstructions=lessonForm.contentText.trim();}
    if(type==='youtube'){
      const url=lessonForm.youtubeUrl.trim();
      try {
        const parsed=new URL(url);
        if(!['youtube.com','www.youtube.com','youtu.be','www.youtu.be'].includes(parsed.hostname))throw Error('Invalid host');
      }catch{setError('Use a valid YouTube video link.');return;}
      content.youtubeUrl=url;
    }
    if(['quiz','exam'].includes(type)){
      if(!lessonForm.questions.length || lessonForm.questions.some(q=>!q.question.trim()||q.options.length!==4||q.options.some(option=>!option.trim())||q.correctAnswer<0||q.correctAnswer>3)){
        setError('Every question needs a prompt, four options and a correct answer.');return;
      }
      const questions=lessonForm.questions.map(q=>({...q,question:q.question.trim(),options:q.options.map(o=>o.trim())}));
      if(type==='quiz')content.quizQuestions=questions;
      else {
        content.examQuestions=questions;
        content.examDuration=Math.max(1,Number(lessonForm.examDuration)||60);
        content.passingScore=Math.min(100,Math.max(1,Number(lessonForm.passingScore)||85));
      }
    } else if(type!=='youtube'&&!lessonForm.contentText.trim()) {
      setError('Add content to the lesson before saving.');return;
    }
    setSaving(true);
    const payload={
      title:lessonForm.title.trim(),description:lessonForm.description.trim(),contentType:type,
      section:lessonForm.section,content,isPreview:lessonForm.isPreview,
      completionTime:Math.max(1,Number(lessonForm.completionTime)||15)
    };
    const result=editingLesson
      ?await apiPut<Lesson>(`/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(editingLesson)}`,payload,true)
      :await apiPost<Lesson>(`/courses/${encodeURIComponent(courseId)}/lessons`,payload,true);
    if(result.success){
      setShowLessonForm(false);setNotice(editingLesson?'Lesson updated.':'Lesson added to your curriculum.');
      setOpenSection(lessonForm.section);setVersion(v=>v+1);
    }else setError(result.error||'Could not save your lesson.');
    setSaving(false);
  };

  const deleteLesson=async(lesson:Lesson)=>{
    if(!window.confirm(`Permanently delete lesson "${lesson.title}"?`))return;
    resetError();
    const result=await apiDelete(`/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lesson._id)}`,true);
    if(result.success){setVersion(v=>v+1);setNotice('Lesson deleted.');}
    else setError(result.error||'Unable to remove this lesson.');
  };

  return <div>
    <div className="flex flex-wrap justify-between gap-5 items-end mb-7"><div><span className="ih-eyebrow">Learning pathway</span><h2 className="text-2xl sm:text-3xl tracking-tight font-bold mt-4">Build your curriculum.</h2><p className="ih-muted text-sm mt-3">Organize learning into sections, lessons and knowledge checks.</p></div><button type="button" className="ih-btn ih-btn-primary" onClick={createSection}><PlusIcon className="w-4 h-4"/>New section</button></div>
    <div className="grid sm:grid-cols-3 gap-4 mb-8">{[
      {label:'Curriculum sections',value:sections.length,icon:ListBulletIcon},
      {label:'Lessons and activities',value:lessons.length,icon:BookOpenIcon},
      {label:'Knowledge checks',value:lessons.filter(l=>l.contentType==='quiz'||l.contentType==='exam').length,icon:ClipboardDocumentListIcon}
    ].map(card=><div key={card.label} className="ih-card p-6 flex gap-4 items-center"><div className="p-3 bg-[#e9f3e6] rounded-xl"><card.icon className="w-6 h-6 text-[#287c4e]"/></div><div><p className="text-sm ih-muted">{card.label}</p><p className="text-2xl font-extrabold tracking-tight mt-1">{card.value}</p></div></div>)}</div>

    {error&&<p role="alert" className="p-4 mb-5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">{error}</p>}
    {notice&&<p role="status" className="p-4 mb-5 rounded-xl bg-[#e5f2e4] text-[#286d4b] border border-[#bedfc0] text-sm">{notice}</p>}
    {showSectionForm&&<form onSubmit={e=>void saveSection(e)} className="ih-card p-7 sm:p-8 mb-7 space-y-4"><h3 className="font-bold text-xl">{editingSection?'Edit section':'Add a section'}</h3><div><label htmlFor="section-title" className="ih-form-label">Section title</label><input id="section-title" className="ih-input" maxLength={100} required value={sectionForm.title} onChange={e=>setSectionForm(v=>({...v,title:e.target.value}))} placeholder="Example: Foundations"/></div><div><label htmlFor="section-description" className="ih-form-label">Description</label><textarea id="section-description" className="ih-input !min-h-[90px]" value={sectionForm.description} onChange={e=>setSectionForm(v=>({...v,description:e.target.value}))} placeholder="What will learners explore in this section?"/></div><div className="flex justify-end gap-3"><button type="button" className="ih-btn ih-btn-neutral" onClick={()=>setShowSectionForm(false)}>Cancel</button><button type="submit" disabled={saving} className="ih-btn ih-btn-primary">{saving?'Saving...':'Save section'}</button></div></form>}

    {showLessonForm&&<form onSubmit={e=>void saveLesson(e)} className="ih-card p-7 sm:p-9 mb-7 space-y-6"><div className="flex flex-wrap gap-4 items-start justify-between"><div><span className="ih-eyebrow">Lesson designer</span><h3 className="text-xl font-bold mt-4">{editingLesson?'Edit lesson':'Create a lesson'}</h3><p className="text-sm ih-muted mt-2">Write content, link learning videos or build assessments.</p></div><button type="button" className="ih-btn ih-btn-neutral" onClick={()=>setShowLessonForm(false)}>Close</button></div>
      <div className="grid sm:grid-cols-2 gap-5"><div><label htmlFor="lesson-title" className="ih-form-label">Lesson title *</label><input id="lesson-title" className="ih-input" required maxLength={100} value={lessonForm.title} onChange={e=>changeLesson('title',e.target.value)}/></div><div><label htmlFor="lesson-section" className="ih-form-label">Section *</label><select id="lesson-section" className="ih-input" required value={lessonForm.section} onChange={e=>changeLesson('section',e.target.value)}><option value="">Select section</option>{sections.map(s=><option key={s._id} value={s._id}>{s.title}</option>)}</select></div></div>
      <div><label htmlFor="lesson-description" className="ih-form-label">Short description *</label><textarea id="lesson-description" className="ih-input !min-h-[85px]" required value={lessonForm.description} onChange={e=>changeLesson('description',e.target.value)}/></div>
      <div className="grid sm:grid-cols-3 gap-5"><div><label htmlFor="lesson-type" className="ih-form-label">Content type</label><select id="lesson-type" className="ih-input" value={lessonForm.contentType} onChange={e=>changeLesson('contentType',e.target.value)}><option value="text">Written lesson</option><option value="youtube">YouTube lesson</option><option value="assignment">Assignment</option><option value="quiz">Quiz</option><option value="exam">Exam</option></select></div><div><label htmlFor="lesson-time" className="ih-form-label">Estimated minutes</label><input id="lesson-time" className="ih-input" type="number" min={1} max={600} value={lessonForm.completionTime} onChange={e=>changeLesson('completionTime',e.target.value)}/></div><label className="flex gap-3 items-center pt-7 text-sm font-semibold"><input type="checkbox" className="accent-[#19654e] w-4 h-4" checked={lessonForm.isPreview} onChange={e=>changeLesson('isPreview',e.target.checked)}/> Allow preview</label></div>
      {lessonForm.contentType==='youtube'?<div><label htmlFor="lesson-url" className="ih-form-label">YouTube video URL</label><input id="lesson-url" type="url" className="ih-input" required placeholder="https://www.youtube.com/watch?v=..." value={lessonForm.youtubeUrl} onChange={e=>changeLesson('youtubeUrl',e.target.value)}/></div>:
      lessonForm.contentType==='text'||lessonForm.contentType==='assignment'?<div><label htmlFor="lesson-content" className="ih-form-label">{lessonForm.contentType==='assignment'?'Assignment instructions':'Lesson text'}</label><textarea id="lesson-content" className="ih-input !min-h-[200px] leading-7" required value={lessonForm.contentText} onChange={e=>changeLesson('contentText',e.target.value)} placeholder="Write the material learners will see..."/></div>:
      <div className="space-y-5"><div className="flex justify-between items-center gap-3 flex-wrap"><h4 className="text-lg font-bold">Assessment questions</h4><button type="button" className="ih-btn ih-btn-neutral !min-h-10 !text-xs" onClick={()=>setLessonForm(d=>({...d,questions:[...d.questions,blankQuestion()]}))}><PlusIcon className="w-4 h-4"/>Add question</button></div>
        {lessonForm.questions.map((q,i)=><div key={i} className="rounded-2xl bg-[#f6faf4] border border-[#dfeadf] p-5 space-y-4"><div className="flex gap-4 items-center justify-between"><h5 className="font-bold text-sm">Question {i+1}</h5><button type="button" className="text-red-700 text-xs font-semibold disabled:opacity-40" disabled={lessonForm.questions.length<2} onClick={()=>setLessonForm(d=>({...d,questions:d.questions.filter((_,index)=>index!==i)}))}>Remove</button></div><div><label className="ih-form-label" htmlFor={`prompt-${i}`}>Question prompt</label><input required id={`prompt-${i}`} className="ih-input" value={q.question} onChange={e=>changeQuestion(i,{question:e.target.value})}/></div>
          <div className="grid sm:grid-cols-2 gap-3">{q.options.map((option,j)=><div key={j}><label className="ih-form-label" htmlFor={`q-${i}-option-${j}`}>Option {j+1}</label><input className="ih-input" id={`q-${i}-option-${j}`} required value={option} onChange={e=>changeQuestion(i,{options:q.options.map((v,k)=>k===j?e.target.value:v)})}/></div>)}</div>
          <div><label htmlFor={`answer-${i}`} className="ih-form-label">Correct answer</label><select id={`answer-${i}`} className="ih-input" value={q.correctAnswer} onChange={e=>changeQuestion(i,{correctAnswer:Number(e.target.value)})}>{q.options.map((_,j)=><option key={j} value={j}>Option {j+1}</option>)}</select></div>
        </div>)}
        {lessonForm.contentType==='exam'&&<div className="grid sm:grid-cols-2 gap-4"><div><label htmlFor="exam-duration" className="ih-form-label">Exam duration (minutes)</label><input id="exam-duration" className="ih-input" min={1} type="number" value={lessonForm.examDuration} onChange={e=>changeLesson('examDuration',e.target.value)}/></div><div><label htmlFor="exam-pass" className="ih-form-label">Passing score (%)</label><input id="exam-pass" className="ih-input" min={1} max={100} type="number" value={lessonForm.passingScore} onChange={e=>changeLesson('passingScore',e.target.value)}/></div></div>}
      </div>}
      {error&&<p role="alert" className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl text-sm">{error}</p>}
      <div className="border-t border-[#e4ece2] pt-6 flex justify-end gap-3"><button type="button" className="ih-btn ih-btn-neutral" onClick={()=>setShowLessonForm(false)}>Cancel</button><button type="submit" disabled={saving} className="ih-btn ih-btn-primary"><CheckCircleIcon className="w-5 h-5"/>{saving?'Saving...':'Save lesson'}</button></div>
    </form>}

    {loading?<div className="space-y-4" aria-label="Loading curriculum">{[1,2,3].map(i=><div key={i} className="ih-skeleton h-[105px]"/>)}</div>:
    sections.length===0?<div className="ih-empty"><ListBulletIcon className="w-11 h-11 text-[#4d936d]"/><h3 className="text-xl font-bold mt-5">Start with a section.</h3><p className="ih-muted text-sm mt-3 max-w-lg">A section groups lessons into a clear learning path. Add a section before creating your first lesson.</p><button type="button" className="ih-btn ih-btn-primary mt-6" onClick={createSection}><PlusIcon className="h-4 w-4"/>Create your first section</button></div>:
    <div className="space-y-5">{sections.map((s,i)=>{
      const list=grouped.get(s._id)||[];
      const expanded=openSection===s._id;
      return <section key={s._id} className="ih-card overflow-hidden">
        <div className="p-5 sm:p-7 flex flex-wrap items-center justify-between gap-4"><button type="button" className="inline-flex gap-4 items-center text-left flex-1 min-w-[200px]" aria-expanded={expanded} onClick={()=>setOpenSection(v=>v===s._id?null:s._id)}><span className="w-11 h-11 rounded-xl bg-[#e6f3e6] text-[#317a51] font-bold grid place-items-center">{String(i+1).padStart(2,'0')}</span><span><strong className="block text-lg font-bold">{s.title}</strong><span className="text-xs ih-muted mt-1 block">{list.length} {list.length===1?'lesson':'lessons'} {s.description&&'· '+s.description}</span></span><ChevronDownIcon className={`ml-auto w-5 h-5 text-[#568a64] transition-transform ${expanded?'rotate-180':''}`}/></button>
          <div className="flex gap-2"><button type="button" onClick={()=>editSection(s)} className="ih-btn ih-btn-neutral !min-h-9 !px-3 !text-xs" aria-label={`Edit section ${s.title}`}><PencilSquareIcon className="w-4 h-4"/>Edit</button><button type="button" onClick={()=>void deleteSection(s)} className="ih-btn ih-btn-neutral !min-h-9 !px-3 !text-xs !text-red-700" aria-label={`Delete section ${s.title}`}><TrashIcon className="w-4 h-4"/></button></div>
        </div>
        {expanded&&<div className="border-t border-[#e5ece3] bg-[#fbfdf9] px-5 sm:px-7 pb-5"><div className="divide-y divide-[#e7eee5]">
          {list.map(l=>{const Icon=lessonIcon(l.contentType);return <div key={l._id} className="flex flex-wrap justify-between items-center gap-4 py-4"><div className="inline-flex items-center gap-3"><span className="p-3 rounded-xl bg-[#e8f3e9]"><Icon className="h-5 w-5 text-[#407d56]"/></span><div><p className="font-semibold text-sm">{l.title}</p><p className="text-xs ih-muted capitalize mt-1">{l.contentType} · {l.completionTime||15} min {l.isPreview?'· Preview':''}</p></div></div><div className="flex gap-3"><button type="button" onClick={()=>editLesson(l)} className="font-bold text-xs text-[#2a7952]">Edit</button><button type="button" onClick={()=>void deleteLesson(l)} className="font-bold text-xs text-red-700">Delete</button></div></div>})}
          {list.length===0&&<p className="text-sm ih-muted py-6">No lessons in this section yet.</p>}
        </div><button type="button" onClick={()=>createLesson(s._id)} className="ih-btn ih-btn-neutral mt-4 !min-h-10 !text-xs"><PlusIcon className="w-4 h-4"/>Add lesson</button></div>}
      </section>;
    })}
    {(grouped.get('unassigned')?.length||0)>0&&<div className="ih-card p-6"><h3 className="font-bold">Unassigned lessons</h3><p className="text-sm ih-muted mt-2">Assign these lessons to a section so they appear in the course outline.</p>{grouped.get('unassigned')!.map(l=><div key={l._id} className="flex gap-4 justify-between items-center border-t border-[#e6ece4] py-4 mt-3"><span className="text-sm">{l.title}</span><button type="button" className="text-[#287951] text-xs font-bold" onClick={()=>editLesson(l)}>Assign section</button></div>)}</div>}
    </div>}
    <p className="mt-6 text-xs ih-muted leading-6">Video uploads and advanced media processing will be added with the secure media service. You can currently create text lessons, YouTube lessons, assignments and question-based assessments.</p>
  </div>;
}
