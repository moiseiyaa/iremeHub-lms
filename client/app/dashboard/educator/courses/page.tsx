'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  AcademicCapIcon, 
  PlusIcon, 
  PencilSquareIcon,
  ChartBarIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { apiGet, apiDelete } from '../../../api/apiClient';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: {
    url: string;
  };
  level: string;
  category: string;
  status: string;
  price: number;
  enrollmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function EducatorCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // This endpoint will need to be implemented in your backend
        const response = await apiGet<{ success: boolean; data: Course[] }>('/educator/courses', true);
        
        if (response.success && Array.isArray(response.data)) {
          setCourses(response.data);
        } else {
          console.error('API returned unsuccessful response:', response);
          setError('Failed to load courses. Server returned an unsuccessful response.');
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('An error occurred while fetching your courses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  const handleDelete = async (courseId: string) => {
    if (confirmDelete !== courseId) {
      setConfirmDelete(courseId);
      return;
    }
    
    try {
      setIsDeleting(true);
      
      // This endpoint will need to be implemented in your backend
      const response = await apiDelete(`/educator/courses/${courseId}`, true);
      
      if (response.success) {
        setCourses(courses.filter(course => course._id !== courseId));
      } else {
        setError('Failed to delete course');
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('An error occurred while deleting the course');
    } finally {
      setIsDeleting(false);
      setConfirmDelete(null);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClasses = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch(status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
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
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Courses</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage, edit and monitor all your courses
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link 
              href="/dashboard/educator/courses/create" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New Course
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="relative flex-1 max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter courses by status"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No courses found</h3>
              <p className="mt-1 text-gray-500">
                {courses.length === 0 
                  ? "You haven't created any courses yet." 
                  : "No courses match your current filters."}
              </p>
              {courses.length === 0 && (
                <div className="mt-6">
                  <Link 
                    href="/dashboard/educator/courses/create" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Your First Course
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCourses.map((course) => (
                    <tr key={course._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            {course.thumbnail?.url ? (
                              <Image 
                                src={course.thumbnail.url} 
                                alt={course.title}
                                width={40}
                                height={40}
                                className="rounded object-cover"
                              />
                            ) : (
                              <div className="bg-blue-100 rounded flex items-center justify-center h-10 w-10">
                                <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{course.title}</div>
                            <div className="text-sm text-gray-500">
                              {course.level} • {course.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(course.status)}`}>
                          {course.status ? course.status.charAt(0).toUpperCase() + course.status.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.enrollmentCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${course.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link
                          href={`/dashboard/educator/courses/${course._id}/edit`}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-md inline-flex items-center"
                          title="Edit course"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/educator/courses/${course._id}/analytics`}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-md inline-flex items-center"
                          title="View analytics"
                        >
                          <ChartBarIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(course._id)}
                          className={`text-red-600 hover:text-red-900 ${confirmDelete === course._id ? 'bg-red-100' : 'bg-red-50 hover:bg-red-100'} p-1.5 rounded-md inline-flex items-center ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={isDeleting}
                          title={confirmDelete === course._id ? "Click again to confirm delete" : "Delete course"}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 