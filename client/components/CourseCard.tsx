import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

// Replace any usage of Cloudinary demo URLs
const DEFAULT_COURSE_IMAGE = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Course';

// Utility function to ensure we never have empty image URLs
const getSafeImageUrl = (url: string | undefined | null, fallback: string): string => {
  if (!url || typeof url !== 'string' || url.trim() === '' || url.includes('res.cloudinary.com/demo')) {
    return fallback;
  }
  return url;
};

// Utility function to generate CSS classes for progress bars
const getProgressWidth = (percentage: number): string => {
  // Handle bounds
  if (percentage <= 0) return 'w-0';
  if (percentage >= 100) return 'w-full';
  
  // Map percentages to Tailwind width classes
  if (percentage <= 5) return 'w-[5%]';
  if (percentage <= 10) return 'w-[10%]';
  if (percentage <= 20) return 'w-[20%]';
  if (percentage <= 25) return 'w-1/4';
  if (percentage <= 30) return 'w-[30%]';
  if (percentage <= 33) return 'w-1/3';
  if (percentage <= 40) return 'w-[40%]';
  if (percentage <= 50) return 'w-1/2';
  if (percentage <= 60) return 'w-[60%]';
  if (percentage <= 66) return 'w-2/3';
  if (percentage <= 70) return 'w-[70%]';
  if (percentage <= 75) return 'w-3/4';
  if (percentage <= 80) return 'w-[80%]';
  if (percentage <= 90) return 'w-[90%]';
  return 'w-[95%]';
};

interface CourseCardProps {
  course: {
    _id: string;
    title: string;
    description: string;
    thumbnail: {
      url: string;
    };
    level: string;
    category: string;
    progress: {
      completedLessons: number;
      totalLessons: number;
      percentage: number;
      lastAccessedAt: string;
    };
  };
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <Link 
      href={`/courses/${course._id}/learn`}
      className="block bg-white border border-secondary/50 rounded-lg overflow-hidden shadow-md 
                hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 
                transition-all duration-300 hover:animate-popHover hover:-translate-y-1"
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 h-48 md:h-auto relative">
          <Image
            src={getSafeImageUrl(course.thumbnail?.url, DEFAULT_COURSE_IMAGE)}
            alt={course.title}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="flex-1 p-6">
          <div className="flex flex-col h-full">
            <div>
              <h3 className="text-xl font-semibold text-dark mb-2">
                {course.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {course.description}
              </p>
              
              <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
                <span className="capitalize">{course.level}</span>
                <span>•</span>
                <span>{course.category}</span>
                {course.progress.lastAccessedAt && (
                  <>
                    <span>•</span>
                    <span className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      Last accessed {formatDate(course.progress.lastAccessedAt)}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="mb-2">
                <div className="flex justify-between text-sm font-medium text-dark">
                  <span>Progress</span>
                  <span>{course.progress.percentage}%</span>
                </div>
                <div className="mt-2 w-full bg-secondary rounded-full h-2">
                  <div 
                    className={`bg-primary h-2 rounded-full transition-all duration-300 ${getProgressWidth(course.progress.percentage)}`}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {course.progress.completedLessons} of {course.progress.totalLessons} lessons completed
                </span>
                <ArrowRightIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard; 