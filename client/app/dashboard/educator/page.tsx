'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  PresentationChartBarIcon, 
  PencilSquareIcon,
  BellAlertIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { apiGet } from '../../api/apiClient';
import ReportGenerationButton from '../../components/ReportGenerationButton';

interface UserData {
  name: string;
  email: string;
  role: string;
}

interface CourseData {
  _id: string;
  title: string;
  enrollmentCount: number;
  completion: number;
  createdAt: string;
}

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalLessons: number;
  activeEnrollments: number;
  completionRate: number;
  recentCoursesCreated: CourseData[];
}

export default function EducatorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalLessons: 0,
    activeEnrollments: 0,
    completionRate: 0,
    recentCoursesCreated: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        try {
          const userResponse = await apiGet<UserData>('/auth/me', true);
          if (userResponse.success && userResponse.data) {
            const profile = userResponse.data;
            setUser(profile);
            
            // Check if user is an educator/instructor
            if (profile.role !== 'educator' && profile.role !== 'admin') {
              router.push('/dashboard');
              return;
            }
          }
        } catch (userErr) {
          console.error('User fetch error:', userErr);
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        
        // Fetch educator dashboard stats
        try {
          // This endpoint will need to be implemented in your backend
          const statsResponse = await apiGet<DashboardStats>('/educator/dashboard-stats', true);
          if (statsResponse.success && statsResponse.data) {
            const statsData = statsResponse.data;
            setStats(statsData);
          }
        } catch (statsErr) {
          console.error('Stats fetch error:', statsErr);
          // Use dummy data for now
          setStats({
            totalCourses: 5,
            totalStudents: 128,
            totalLessons: 42,
            activeEnrollments: 87,
            completionRate: 68,
            recentCoursesCreated: [
              {
                _id: '1',
                title: 'Introduction to Web Development',
                enrollmentCount: 45,
                completion: 72,
                createdAt: '2023-04-15T00:00:00.000Z'
              },
              {
                _id: '2',
                title: 'Advanced JavaScript Concepts',
                enrollmentCount: 31,
                completion: 65,
                createdAt: '2023-05-20T00:00:00.000Z'
              },
              {
                _id: '3',
                title: 'React Framework Deep Dive',
                enrollmentCount: 28,
                completion: 58,
                createdAt: '2023-06-10T00:00:00.000Z'
              }
            ]
          });
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load educator dashboard data');
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
    
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading educator dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Educator Dashboard</h1>
          <p className="mt-1 text-gray-500">
            Welcome back, {user?.name || 'Educator'}!
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AcademicCapIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.totalCourses}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link href="/dashboard/educator/courses" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                View courses
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.totalStudents}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link href="/dashboard/educator/students" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                View students
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Lessons</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.totalLessons}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm text-gray-500 font-medium">
                Across all courses
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Enrollments</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.activeEnrollments}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link href="/dashboard/educator/enrollments" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                Manage enrollments
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <PresentationChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.completionRate}%</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm text-gray-500 font-medium">
                Average across courses
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Courses */}
          <div className="lg:col-span-2 bg-white shadow rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Your Recent Courses</h2>
              <Link href="/dashboard/educator/courses/create" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <PencilSquareIcon className="h-4 w-4 mr-2" />
                Create Course
              </Link>
            </div>
            <div className="px-6 py-5">
              {stats.recentCoursesCreated.length === 0 ? (
                <div className="text-center py-8">
                  <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No courses yet</h3>
                  <p className="mt-1 text-gray-500">
                    You haven&apos;t created any courses yet.
                  </p>
                  <div className="mt-6">
                    <Link 
                      href="/dashboard/educator/courses/create" 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create Your First Course
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {stats.recentCoursesCreated.map((course) => (
                      <li key={course._id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                              <AcademicCapIcon className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {course.title}
                            </p>
                            <div className="flex items-center mt-1">
                              <p className="text-sm text-gray-500 mr-4">
                                <span className="font-medium">{course.enrollmentCount}</span> enrolled
                              </p>
                              <p className="text-sm text-gray-500">
                                <span className="font-medium">{course.completion}%</span> completion
                              </p>
                            </div>
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/educator/courses/${course._id}/edit`}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Link 
                      href="/dashboard/educator/courses" 
                      className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center"
                    >
                      View all courses
                      <ChevronRightIcon className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Report Generation */}
          <div className="mb-6 flex justify-end">
            <ReportGenerationButton />
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              </div>
              <div className="px-6 py-5">
                <nav className="space-y-3">
                  <Link
                    href="/dashboard/educator/courses/create"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600"
                  >
                    <PencilSquareIcon className="mr-3 h-5 w-5 text-gray-400" />
                    Create a new course
                  </Link>
                  <Link
                    href="/dashboard/educator/announcements"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600"
                  >
                    <BellAlertIcon className="mr-3 h-5 w-5 text-gray-400" />
                    Manage announcements
                  </Link>
                  <Link
                    href="/dashboard/educator/students"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600"
                  >
                    <UserGroupIcon className="mr-3 h-5 w-5 text-gray-400" />
                    View student progress
                  </Link>
                </nav>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Resources</h2>
              </div>
              <div className="px-6 py-5">
                <ul className="space-y-4">
                  <li>
                    <a 
                      href="#" 
                      className="block text-sm text-blue-600 hover:text-blue-800"
                    >
                      Teaching Guidelines & Best Practices
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="block text-sm text-blue-600 hover:text-blue-800"
                    >
                      Content Creation Tips
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="block text-sm text-blue-600 hover:text-blue-800"
                    >
                      Engagement Strategies for Online Learning
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="block text-sm text-blue-600 hover:text-blue-800"
                    >
                      Assessment Design Guide
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 