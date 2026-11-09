import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRightIcon, BookOpenIcon } from '@heroicons/react/24/outline';

export interface CatalogCourse {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: { url?: string };
  price?: number;
  level?: string;
  category?: string;
  ratings?: { average?: number; count?: number } | unknown[];
}

interface LiveCourseCardProps { course: CatalogCourse; featured?: boolean; }

const validThumbnail = (value?: string) =>
  Boolean(value && /^https?:\/\//.test(value) && !value.includes('res.cloudinary.com/demo'));

export default function LiveCourseCard({ course, featured = false }: LiveCourseCardProps) {
  const rating = course.ratings && !Array.isArray(course.ratings) && typeof (course.ratings as {average?: unknown}).average === 'number'
    ? (course.ratings as {average: number}).average : null;
  const thumbnail = course.thumbnail?.url;
  return (
    <article className="ih-card ih-course-card group flex flex-col h-full">
      <Link href={`/courses/${course._id}`} className="block" aria-label={`View course: ${course.title}`}>
        <div className={`ih-course-art ${featured ? 'bg-[#cde7d6]' : ''}`}>
          {validThumbnail(thumbnail) ? <Image src={thumbnail!} alt="" fill unoptimized sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px" className="object-cover group-hover:scale-[1.04] transition-transform duration-500"/> :
            <div className="absolute inset-0 p-7 flex flex-col justify-between"><BookOpenIcon className="h-9 w-9 text-[#2c7653]"/><span className="text-[#26583e] font-extrabold tracking-[-.06em] text-2xl">iremehub+</span></div>}
          <span className="absolute top-4 left-4 bg-white/95 text-[#1e6046] rounded-full text-[11px] font-bold px-3 py-1.5">{course.category || 'Learning'}</span>
        </div>
      </Link>
      <div className="p-6 flex flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#73887b] font-medium">
          <span>{course.level || 'All levels'}</span><span>{course.price === 0 ? 'Free course' : 'Course'}</span>
        </div>
        <h3 className="ih-course-title mt-4"><Link href={`/courses/${course._id}`} className="hover:text-[#22815c]">{course.title}</Link></h3>
        <p className="text-sm leading-6 text-[#708077] mt-3 line-clamp-2 flex-1">{course.description || 'Explore the full curriculum and course details.'}</p>
        <div className="mt-6 pt-4 border-t border-[#edf0ea] flex items-center justify-between">
          <span className="text-xs text-[#68806f]">{rating !== null ? `★ ${rating.toFixed(1)} learner rating` : 'Explore curriculum'}</span>
          <Link href={`/courses/${course._id}`} aria-label={`View ${course.title}`} className="w-9 h-9 rounded-full bg-[#edf5ed] text-[#23694c] grid place-items-center group-hover:bg-[#d8f59d] transition-colors"><ArrowUpRightIcon className="h-5 w-5"/></Link>
        </div>
      </div>
    </article>
  );
}
