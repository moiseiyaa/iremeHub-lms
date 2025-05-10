'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AcademicCapIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { apiGet } from '../api/apiClient';
import dynamic from 'next/dynamic';

const CourseCard = dynamic(() => import('../../components/CourseCard'), {
  loading: () => (
    <div className="animate-pulse bg-gray-200 rounded-lg h-48"></div>
  ),
});

interface Course {
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
}

interface UserData {
  name: string;
  email: string;
  role: string;
}

// Define the API response type
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export default function Dashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile using the API client
        try {
          const response = await apiGet<ApiResponse<UserData>>('/auth/me', true);
          if (response.success && response.data) {
            setUser(response.data);
            
            // Redirect based on user role - Use a separate effect to handle redirection
            if (response.data.role === 'educator' || response.data.role === 'admin') {
              // Keep loading true to prevent student dashboard from showing
              return;
            }
          }
        } catch (userErr) {
          console.error('User fetch error:', userErr);
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        
        // Fetch enrolled courses with progress
        try {
          const response = await apiGet<ApiResponse<Course[]>>('/courses/my/enrolled', true);
          if (response.success && response.data && Array.isArray(response.data)) {
            setCourses(response.data);
          }
        } catch (courseErr) {
          console.error('Course fetch error:', courseErr);
          setError('Could not load your enrolled courses');
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    // Check for token before making API requests
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchUserData();
  }, [router]);

  // Handle role-based redirection in a separate effect to avoid flash of content
  useEffect(() => {
    if (user?.role === 'admin') {
      router.push('/dashboard/admin');
    } else if (user?.role === 'educator') {
      router.push('/dashboard/educator');
    }
  }, [user, router]);

  if (loading || user?.role === 'educator' || user?.role === 'admin') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[calc(100vh-64px)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-500">
            Welcome back, {user?.name || 'Student'}!
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Your Courses</h2>
              </div>
              <div className="px-6 py-5">
                {courses.length === 0 ? (
                  <div className="text-center py-8">
                    <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No courses yet</h3>
                    <p className="mt-1 text-gray-500">
                      You haven&apos;t enrolled in any courses yet.
                    </p>
                    <div className="mt-6">
                      <Link 
                        href="/courses" 
                        className="btn-primary"
                      >
                        Browse Courses
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {courses.map((course) => (
                      <CourseCard key={course._id} course={course} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Your Stats</h2>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Enrolled Courses</p>
                    <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Completed Courses</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {courses.filter(course => course.progress.percentage === 100).length}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Average Progress</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {courses.length > 0 
                        ? Math.round(courses.reduce((acc, course) => acc + course.progress.percentage, 0) / courses.length)
                        : 0}%
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link
                    href="/profile"
                    className="btn-secondary w-full"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Quick Links</h2>
              </div>
              <div className="px-6 py-5">
                <nav className="space-y-1">
                  <Link
                    href="/courses"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    <ArrowRightIcon className="mr-3 h-4 w-4 text-gray-400" />
                    Browse Courses
                  </Link>
                  <Link
                    href="/payments/history"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    <ArrowRightIcon className="mr-3 h-4 w-4 text-gray-400" />
                    Payment History
                  </Link>
                  <Link
                    href="/certificates"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    <ArrowRightIcon className="mr-3 h-4 w-4 text-gray-400" />
                    Your Certificates
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 