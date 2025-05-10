import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

// Default fallback image
const DEFAULT_COURSE_IMAGE = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Course';

// Utility function to ensure we never have empty image URLs
const getSafeImageUrl = (url: string | undefined | null, fallback: string): string => {
  if (!url || typeof url !== 'string' || url.trim() === '' || url.includes('res.cloudinary.com/demo')) {
    return fallback;
  }
  return url;
};

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: {
    url: string;
  };
  price: number;
  level: string;
  category: string;
  ratings?: {
    average: number;
    count: number;
  };
}

interface LiveCourseCardProps {
  course: Course;
  featured?: boolean;
}

const LiveCourseCard: React.FC<LiveCourseCardProps> = ({ course, featured = false }) => {
  return (
    <div
      className={`rounded-xl overflow-hidden border ${
        featured 
          ? 'bg-primary text-white shadow-lg hover:shadow-primary/20' 
          : 'bg-white text-gray-900 border-gray-100 hover:border-primary/30'
      } transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group`}
    >
      <div className="relative h-48">
        <Image
          src={getSafeImageUrl(course.thumbnail?.url, DEFAULT_COURSE_IMAGE)}
          alt={course.title}
          fill
          className="object-cover"
        />
        {course.price === 0 ? (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-md">
            Free
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-primary text-white text-xs px-2 py-1 rounded-md">
            ${course.price}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className={`text-xl font-bold mb-2 ${!featured && 'group-hover:text-primary'} transition-colors line-clamp-1`}>
          {course.title}
        </h3>
        <p className={`${featured ? 'text-white/80' : 'text-gray-600'} text-sm mb-4 line-clamp-2`}>
          {course.description}
        </p>
        <div className="flex justify-between items-center mt-auto">
          <div className="flex items-center">
            <span className={`${featured ? 'text-white' : 'text-primary'} font-semibold`}>
              {course.ratings?.average || 4.5}
            </span>
            <div className="flex ml-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(course.ratings?.average || 4.5) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className={`text-xs ${featured ? 'text-white/80' : 'text-gray-500'} ml-1`}>
              ({course.ratings?.count || 0})
            </span>
          </div>
          <span className={`text-sm ${featured ? 'text-white/80' : 'text-gray-600'} capitalize`}>
            {course.level}
          </span>
        </div>

        <Link
          href={`/courses/${course._id}`}
          className={`mt-4 w-full inline-block text-center py-2 rounded-lg font-medium transition-colors ${
            featured
              ? 'bg-white text-primary hover:bg-white/90'
              : 'bg-primary text-white hover:bg-primary/90'
          } group-hover:shadow-md group-hover:shadow-primary/20`}
        >
          View Course <ArrowRightIcon className="inline-block h-4 w-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default LiveCourseCard; 