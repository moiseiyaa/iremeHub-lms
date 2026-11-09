import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRightIcon, BookOpenIcon } from '@heroicons/react/24/outline';

interface EnrolledCourse {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: { url?: string };
  level?: string;
  category?: string;
  progress?: {
    completedLessons?: number | string[];
    totalLessons?: number;
    percentage?: number;
    lastAccessedAt?: string;
  };
}

export default function CourseCard({course}: {course: EnrolledCourse}) {
  const percentage = Math.max(0, Math.min(100, Number(course.progress?.percentage) || 0));
  const completed = Array.isArray(course.progress?.completedLessons)
    ? course.progress!.completedLessons.length : Number(course.progress?.completedLessons) || 0;
  const total = Number(course.progress?.totalLessons) || 0;
  const image = course.thumbnail?.url;
  const hasImage = Boolean(image && /^https?:\/\//.test(image) && !image.includes('res.cloudinary.com/demo'));
  return (
    <Link href={`/courses/${course._id}/learn`} className="ih-card ih-course-card block overflow-hidden group">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-44 sm:h-auto sm:w-[195px] bg-[#d9e9da] flex-shrink-0 overflow-hidden">
          {hasImage ? <Image src={image!} alt="" fill unoptimized sizes="200px" className="object-cover" /> :
            <div className="h-full min-h-[180px] flex flex-col justify-between p-6 text-[#246a4d]"><BookOpenIcon className="w-7 h-7"/><span className="font-bold text-xl tracking-tight">iremehub+</span></div>}
        </div>
        <div className="p-6 flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-semibold uppercase tracking-[.12em] text-[#528469]">{course.category || 'Course'}</span><span className="text-xs text-[#768d7d]">{course.level || 'All levels'}</span></div>
          <h3 className="text-lg font-bold tracking-tight mt-3 group-hover:text-[#23704f]">{course.title}</h3>
          <p className="mt-2 text-sm text-[#708177] line-clamp-2">{course.description}</p>
          <div className="mt-6 flex items-center justify-between text-xs font-semibold text-[#385f4c]"><span>Learning progress</span><span>{Math.round(percentage)}%</span></div>
          <div role="progressbar" aria-valuenow={Math.round(percentage)} aria-valuemin={0} aria-valuemax={100} aria-label={`${course.title} progress`} className="mt-2 h-2 rounded-full bg-[#e6eee6] overflow-hidden"><div className="h-full rounded-full bg-[#4d9b70]" style={{width:`${percentage}%`}}/></div>
          <div className="mt-3 flex items-center justify-between"><span className="text-xs text-[#7c8c80]">{total > 0 ? `${completed} of ${total} lessons completed` : 'Continue your learning'}</span><span className="text-[#268456] text-sm font-semibold inline-flex items-center gap-1">Continue <ArrowUpRightIcon className="h-4 w-4"/></span></div>
        </div>
      </div>
    </Link>
  );
}
