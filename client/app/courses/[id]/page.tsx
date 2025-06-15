'use client';

import React from 'react';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiGet, apiPost } from '../../api/apiClient';
import { StarIcon, UserIcon, TagIcon, AcademicCapIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon, PlayIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// Default images
const DEFAULT_COURSE_IMAGE = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Course';
const DEFAULT_AVATAR_IMAGE = 'https://placehold.co/100x100/e2e8f0/1e293b?text=User';

// Utility function to ensure we never have empty image URLs
const getSafeImageUrl = (url: string | undefined | null, fallback: string): string => {
  if (url === undefined || url === null || typeof url !== 'string') {
    return fallback;
  }
  
  if (url.trim() === '') {
    return fallback;
  }
  
  if (url.includes('res.cloudinary.com/demo')) {
    return fallback;
  }
  
  return url;
};

interface Lesson {
  _id: string;
  title: string;
  description: string;
  contentType: string;
  isPreview: boolean;
  order: number;
  completionTime: number;
  section?: {
    _id: string;
    title: string;
  };
}

interface Rating {
  _id: string;
  rating: number;
  review: string;
  user: {
    name: string;
    avatar: {
      url: string;
    };
  };
  createdAt: string;
}

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
  ratings: Rating[];
  instructor: {
    _id: string;
    name: string;
    avatar: {
      url: string;
    };
    bio: string;
  };
  enrolledStudents: string[];
  averageRating: number;
  isPublished: boolean;
}

interface Progress {
  completedLessons: string[];
  lastAccessed: string;
  progressPercentage: number;
  totalLessons: number;
  completed: boolean;
  nextLesson: Lesson | null;
}

interface UserResponse {
  role: string;
}

interface CourseWithProgress {
  course: Course;
  isEnrolled: boolean;
  progress?: Progress;
}

interface CoursePageProps {
  params: {
    id: string;
  };
}

// Add utility function to retry API calls
const fetchWithRetry = async (apiCall: () => Promise<any>, maxRetries = 3) => {
  let retries = 0;
  let lastError: any;
  
  while (retries < maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      retries++;
      console.log(`Retry ${retries}/${maxRetries} for API call due to error:`, error);
      
      // Add exponential backoff delay
      if (retries < maxRetries) {
        const delay = Math.min(1000 * 2 ** retries, 8000); // Cap at 8 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries failed
  throw lastError;
};

export default function CoursePage({ params }: CoursePageProps) {
  // unwrap Next.js params promise
  const { id: courseId } = use(params);
  
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  
  // Group lessons by section
  const lessonsBySection = lessons.reduce((acc: Record<string, Lesson[]>, lesson) => {
    const sectionId = lesson.section?._id || 'uncategorized';
    if (!acc[sectionId]) {
      acc[sectionId] = [];
    }
    acc[sectionId].push(lesson);
    return acc;
  }, {});

  // Format price
  const formatPrice = (price: number | undefined | null) => {
    // If price is undefined or null, show as Free
    if (price === undefined || price === null) {
      return 'Free';
    }
    
    // If price is 0, show as Free
    if (price === 0) {
      return 'Free';
    }
    
    // Otherwise format with 2 decimal places
    return `$${price.toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Check if a lesson is completed
  const isLessonCompleted = (lessonId: string) => {
    return progress?.completedLessons.includes(lessonId) || false;
  };

  // Generate width class based on progress percentage
  const getProgressWidthClass = (percentage: number | undefined) => {
    // Round to nearest 5%
    const safePercentage = typeof percentage === 'number' ? percentage : 0;
    const roundedPercentage = Math.round(safePercentage / 5) * 5;
    return `w-[${roundedPercentage}%]`;
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // IMPORTANT: Always load public data first to ensure course can be viewed
        // even if authentication fails later
        console.log('Loading public course data first');
        
        // Fetch course data with retries
        const publicCourseResponse = await fetchWithRetry(
          () => apiGet(`/courses/${courseId}`, false),
          3 // 3 retries max
        );
        
        // Set course data from public endpoint
        if (typeof publicCourseResponse === 'object') {
          // Handle both TS and JS client formats
          if (publicCourseResponse.success !== undefined) {
            if (publicCourseResponse.success && publicCourseResponse.data) {
              setCourse(publicCourseResponse.data);
            }
          } else {
            setCourse(publicCourseResponse);
          }

          // Also load public lesson data with retry
          const publicLessonsResponse = await fetchWithRetry(
            () => apiGet(`/courses/${courseId}/lessons`, false),
            2 // 2 retries max
          );
          
          if (typeof publicLessonsResponse === 'object') {
            if (publicLessonsResponse.success !== undefined) {
              if (publicLessonsResponse.success && publicLessonsResponse.data) {
                setLessons(publicLessonsResponse.data);
              }
            } else if (Array.isArray(publicLessonsResponse)) {
              setLessons(publicLessonsResponse);
            }
          }
          
          // Public data loaded, now check if user is authenticated
          const token = localStorage.getItem('token');
          const isAuth = !!token;
          setIsAuthenticated(isAuth);
          
          // Now attempt to load authenticated data (progress, enrollment, etc)
          // These are secondary and can fail without breaking the page
          if (isAuth) {
            console.log('Attempting to load authenticated data');
            try {
              // Try to get user role - but don't throw if it fails
              try {
                const userResponse = await fetchWithRetry(
                  () => apiGet('/auth/me', true),
                  1 // Just 1 retry for user data
                );
                if (typeof userResponse === 'object') {
                  if (userResponse.success !== undefined && userResponse.success && userResponse.data) {
                    setUserRole(userResponse.data.role);
                  } else if (userResponse.role) {
                    setUserRole(userResponse.role);
                  }
                }
              } catch (userError) {
                console.error('Failed to get user role, continuing anyway:', userError);
              }
              
              // Try to get enrollment status - but don't throw if it fails
              try {
                const progressResponse = await fetchWithRetry(
                  () => apiGet(`/courses/${courseId}/with-progress`, true),
                  2 // 2 retries for progress data
                );
                if (typeof progressResponse === 'object') {
                  if (progressResponse.success !== undefined && progressResponse.success && progressResponse.data) {
                    setIsEnrolled(progressResponse.data.isEnrolled);
                    if (progressResponse.data.progress) {
                      setProgress(progressResponse.data.progress);
                    }
                  } else if (progressResponse.isEnrolled !== undefined) {
                    setIsEnrolled(progressResponse.isEnrolled);
                    if (progressResponse.progress) {
                      setProgress(progressResponse.progress);
                    }
                  }
                }
              } catch (progressError) {
                console.error('Failed to get enrollment status, continuing anyway:', progressError);
              }
              
              // Try to get full lesson data - but don't throw if it fails
              try {
                const fullLessonsResponse = await fetchWithRetry(
                  () => apiGet(`/courses/${courseId}/lessons`, true),
                  2 // 2 retries for lesson data
                );
                if (typeof fullLessonsResponse === 'object') {
                  if (fullLessonsResponse.success !== undefined && fullLessonsResponse.success && fullLessonsResponse.data) {
                    setLessons(fullLessonsResponse.data);
                  } else if (Array.isArray(fullLessonsResponse)) {
                    setLessons(fullLessonsResponse);
                  }
                }
              } catch (lessonError) {
                console.error('Failed to get full lesson data, continuing with preview lessons:', lessonError);
              }
            } catch (authError) {
              // Authentication errors should not prevent viewing the course
              console.error('Authentication failed but course can still be viewed:', authError);
            }
          }
        } else {
          throw new Error('Failed to load course data');
        }
      } catch (err) {
        console.error('Course fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      const currentPath = `/courses/${courseId}`;
      window.location.href = `/register?redirect=${encodeURIComponent(currentPath)}`;
      return;
    }
    
    try {
      setEnrollmentLoading(true);
      const response = await apiPost(`/courses/${courseId}/enroll`, {}, true);
      
      if (response.success) {
        setIsEnrolled(true);
        // Refresh page to get updated enrollment status and progress
        window.location.reload();
      } else {
        setError(response.error || 'Failed to enroll in the course');
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      setError(err instanceof Error ? err.message : 'Failed to enroll in the course');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const startCourse = () => {
    if (progress?.nextLesson) {
      router.push(`/courses/${courseId}/learn?lesson=${progress.nextLesson._id}`);
    } else {
      // If no next lesson, start with the first one
      const firstLesson = lessons.sort((a, b) => a.order - b.order)[0];
      if (firstLesson) {
        router.push(`/courses/${courseId}/learn?lesson=${firstLesson._id}`);
      }
    }
  };

  const continueCourse = () => {
    if (progress?.nextLesson) {
      router.push(`/courses/${courseId}/learn?lesson=${progress.nextLesson._id}`);
    } else {
      // If no specific next lesson (maybe completed), go to course page
      router.push(`/courses/${courseId}/learn`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-red-500 text-2xl">😕</div>
          <h2 className="mt-2 text-xl font-semibold text-gray-900">Error Loading Course</h2>
          <p className="mt-1 text-gray-500">{error}</p>
          <Link href="/courses" className="btn-primary mt-4">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-gray-500 text-2xl">🔍</div>
          <h2 className="mt-2 text-xl font-semibold text-gray-900">Course Not Found</h2>
          <p className="mt-1 text-gray-500">The course you&apos;re looking for does not exist.</p>
          <Link href="/courses" className="btn-primary mt-4">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[calc(100vh-64px)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Course Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="mt-2 text-lg text-gray-500">{course.description}</p>
            
            <div className="mt-4 flex flex-wrap items-center text-sm text-gray-500 gap-4">
              {course?.level && (
                <span className="inline-flex items-center">
                  <AcademicCapIcon className="h-4 w-4 text-gray-400 mr-1" />
                  {course.level}
                </span>
              )}
              
              {course?.category && (
                <span className="inline-flex items-center">
                  <TagIcon className="h-4 w-4 text-gray-400 mr-1" />
                  {course.category}
                </span>
              )}
              
              {course?.ratings && course.ratings.length > 0 && (
                <span className="inline-flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                  {course.averageRating} ({course.ratings.length} {course.ratings.length === 1 ? 'review' : 'reviews'})
                </span>
              )}
              
              {(userRole === 'admin' || userRole === 'educator') && course?.enrolledStudents && (
                <span className="inline-flex items-center">
                  <UserIcon className="h-4 w-4 text-gray-400 mr-1" />
                  {course.enrolledStudents.length} students
                </span>
              )}
            </div>
            
            {course?.instructor && (
              <div className="mt-6 flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                  <Image
                    src={getSafeImageUrl(course.instructor.avatar?.url, DEFAULT_AVATAR_IMAGE)}
                    alt={course.instructor.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Instructor: {course.instructor.name}</p>
                  {course.instructor.bio && (
                    <p className="text-sm text-gray-500 line-clamp-1">{course.instructor.bio}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              <div className="h-48 relative">
                {course && (
                  <Image
                    src={getSafeImageUrl(course.thumbnail?.url, DEFAULT_COURSE_IMAGE)}
                    alt={course.title || 'Course'}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-gray-900 mb-4">
                  {course && formatPrice(course.price)}
                </div>
                
                {isEnrolled ? (
                  <div className="space-y-4">
                    <div className="bg-gray-100 rounded-md p-4">
                      <div className="text-sm text-gray-500 mb-1">Your progress</div>
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>{progress?.progressPercentage || 0}% Complete</span>
                        <span>
                          {progress?.completedLessons.length || 0} / {progress?.totalLessons || 0} lessons
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`bg-indigo-600 h-2.5 rounded-full ${getProgressWidthClass(progress?.progressPercentage)}`}
                        ></div>
                      </div>
                    </div>
                    
                    <button
                      onClick={progress?.completedLessons.length ? continueCourse : startCourse}
                      className="btn-primary w-full"
                    >
                      {progress?.completedLessons.length ? 'Continue Learning' : 'Start Course'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrollmentLoading}
                    className="btn-primary w-full"
                  >
                    {enrollmentLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                        Enrolling...
                      </span>
                    ) : 'Enroll Now'}
                  </button>
                )}
                
                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Full lifetime access</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{lessons.length} lessons with {lessons.filter(l => l.contentType === 'video' || l.contentType === 'youtube').length} videos</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Certificate of completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Course Content */}
        <div className="mt-10">
          <div className="border-b border-gray-200 mb-6">
            <div className="-mb-px flex space-x-8">
              <button className="border-indigo-500 text-indigo-600 py-4 px-1 border-b-2 font-medium text-sm">
                Course Content
              </button>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Course Content
              </h3>
              <div className="mt-1 text-sm text-gray-500">
                {lessons.length} lessons ({Math.ceil(lessons.reduce((acc, lesson) => acc + (lesson.completionTime || 15), 0) / 60)} hours total)
              </div>
              
              <div className="mt-4 space-y-4">
                {Object.entries(lessonsBySection).map(([sectionId, sectionLessons]) => (
                  <div key={sectionId} className="border border-gray-200 rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                      <h4 className="font-medium text-gray-900">
                        {sectionId === 'uncategorized' ? 'Uncategorized Lessons' : sectionLessons[0].section?.title}
                      </h4>
                      <div className="text-sm text-gray-500">
                        {sectionLessons.length} lessons
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {sectionLessons.map((lesson) => (
                        <div key={lesson._id} className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center">
                            {isEnrolled || lesson.isPreview ? (
                              <PlayIcon className="h-5 w-5 text-indigo-600 mr-3" />
                            ) : (
                              <LockClosedIcon className="h-5 w-5 text-gray-400 mr-3" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {lesson.title}
                                {isLessonCompleted(lesson._id) && (
                                  <CheckCircleIcon className="h-4 w-4 text-green-500 ml-2" />
                                )}
                                {lesson.isPreview && !isEnrolled && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Preview
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {lesson.contentType === 'video' || lesson.contentType === 'youtube' ? 'Video' : lesson.contentType}
                                {lesson.completionTime && ` • ${lesson.completionTime} min`}
                              </div>
                            </div>
                          </div>
                          
                          {(isEnrolled || lesson.isPreview) && (
                            <Link
                              href={`/courses/${courseId}/learn?lesson=${lesson._id}`}
                              className="text-sm text-indigo-600 hover:text-indigo-500"
                            >
                              {isLessonCompleted(lesson._id) ? 'Review' : 'Start'}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews */}
        {course?.ratings && Array.isArray(course.ratings) && course.ratings.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
            <div className="mt-6 space-y-6">
              {course.ratings.map((rating) => (
                <div key={rating._id} className="border-t border-gray-200 pt-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                        <Image
                          src={getSafeImageUrl(rating.user?.avatar?.url, DEFAULT_AVATAR_IMAGE)}
                          alt={rating.user?.name || 'User'}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{rating.user?.name || 'User'}</h3>
                      <div className="mt-1 flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < (rating.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-500">
                          {formatDate(rating.createdAt || '')}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">{rating.review || ''}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 