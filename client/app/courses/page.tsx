'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StarIcon, UserIcon, TagIcon, AcademicCapIcon } from '@heroicons/react/24/solid';
import { FunnelIcon, ArrowRightIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { apiGet } from '../api/apiClient';
import CourseFilters from '../../components/CourseFilters';

// Replace any usage of Cloudinary demo URLs
const DEFAULT_COURSE_IMAGE = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Course';
const DEFAULT_AVATAR_IMAGE = 'https://placehold.co/100x100/e2e8f0/1e293b?text=User';

// Utility function to ensure we never have empty image URLs
const getSafeImageUrl = (url: string | undefined | null, fallback: string): string => {
  // Handle undefined, null, and non-string types
  if (url === undefined || url === null || typeof url !== 'string') {
    return fallback;
  }
  
  // Handle empty strings
  if (url.trim() === '') {
    return fallback;
  }
  
  // Replace Cloudinary demo URLs with reliable placeholders
  if (url.includes('res.cloudinary.com/demo')) {
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
  ratings: {
    rating: number;
    count: number;
    average: number;
  };
  instructor: {
    name: string;
    avatar: string;
  };
  enrolledStudents: number;
}

interface CourseResponse {
  success: boolean;
  data: Course[];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    price: ''
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiGet<CourseResponse>('/courses');
        if (response.success && Array.isArray(response.data)) {
          setCourses(response.data);
          setFilteredCourses(response.data);
        } else {
          setCourses([]);
          setFilteredCourses([]);
          setError('No courses available');
        }
      } catch (err) {
        console.error('Course fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load courses');
        setCourses([]);
        setFilteredCourses([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    let result = courses;
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filters.category) {
      result = result.filter(course => course.category === filters.category);
    }
    
    // Apply level filter
    if (filters.level) {
      result = result.filter(course => course.level === filters.level);
    }
    
    // Apply price filter
    if (filters.price === 'free') {
      result = result.filter(course => course.price === 0);
    } else if (filters.price === 'paid') {
      result = result.filter(course => course.price > 0);
    }
    
    setFilteredCourses(result);
  }, [searchQuery, filters, courses]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setFilters({
      category: '',
      level: '',
      price: ''
    });
  };

  const handleEnrollClick = (courseId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the card link from triggering
    
    if (!isAuthenticated) {
      // Redirect guests to signup
      const currentPath = `/courses/${courseId}`;
      window.location.href = `/register?redirect=${encodeURIComponent(currentPath)}`;
    } else {
      // Redirect authenticated users to course view
      window.location.href = `/courses/${courseId}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Section */}
          <aside className="lg:col-span-1">
            <CourseFilters
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAll}
            />
          </aside>

          {/* Courses Grid Section */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-xl p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">All Courses</h1>
              {error ? (
                <div className="bg-white shadow-md rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900">Error loading courses</h3>
                  <p className="mt-1 text-gray-500">{error}</p>
                </div>
              ) : Array.isArray(filteredCourses) && filteredCourses.length === 0 ? (
                <div className="bg-white shadow-md rounded-lg p-8 text-center">
                  <FunnelIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No courses found</h3>
                  <p className="mt-1 text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    onClick={handleClearAll}
                    className="btn-primary mt-4"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <Link 
                      key={course._id} 
                      href={`/courses/${course._id}`}
                      className="course-card group"
                    >
                      <div className="h-48 relative">
                        <Image
                          src={getSafeImageUrl(course.thumbnail?.url, DEFAULT_COURSE_IMAGE)}
                          alt={course.title || 'Course'}
                          fill
                          className="object-cover"
                        />
                        {course.price === 0 ? (
                          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-md">
                            Free
                          </span>
                        ) : (
                          <span className="absolute top-3 right-3 bg-gray-900 text-white text-xs px-2 py-1 rounded-md">
                            ${course.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{course.title}</h3>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{course.description}</p>
                        
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <AcademicCapIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="mr-3">{course.level.charAt(0).toUpperCase() + course.level.slice(1)}</span>
                          
                          <TagIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{course.category}</span>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {course.ratings?.average ? (
                                <>
                                  <StarIcon className="h-4 w-4 text-yellow-400" />
                                  <span className="ml-1 text-sm text-gray-600">
                                    {course.ratings.average.toFixed(1)}
                                  </span>
                                  <span className="ml-1 text-xs text-gray-500">
                                    ({course.ratings.count})
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm text-gray-500">No ratings</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Enroll Button */}
                        <button
                          onClick={(e) => handleEnrollClick(course._id, e)}
                          className="mt-4 w-full bg-gray-900 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors group-hover:bg-gray-800"
                        >
                          <span>{isAuthenticated ? 'View Course' : 'Enroll Now'}</span>
                          {isAuthenticated ? (
                            <ArrowRightIcon className="h-4 w-4" />
                          ) : (
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                          )}
                        </button>
                        
                        {course.instructor && (
                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center">
                            <div className="h-6 w-6 rounded-full bg-gray-200 flex-shrink-0 mr-2 overflow-hidden">
                              {course.instructor.avatar ? (
                                <Image
                                  src={getSafeImageUrl(course.instructor.avatar, DEFAULT_AVATAR_IMAGE)}
                                  alt={course.instructor.name || 'Instructor'}
                                  width={24}
                                  height={24}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <UserIcon className="h-4 w-4 text-gray-400 mx-auto my-1" />
                              )}
                            </div>
                            <span className="text-sm text-gray-600">{course.instructor.name || 'Instructor'}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 