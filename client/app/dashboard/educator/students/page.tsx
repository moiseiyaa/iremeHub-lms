'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon, 
  EnvelopeIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { apiGet } from '../../../api/apiClient';

interface Student {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  enrolledCourses: number;
  lastActive: string;
  progress: number;
  joinedAt: string;
}

interface Course {
  _id: string;
  title: string;
}

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

export default function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilters, setActiveFilters] = useState<{
    courseId?: string;
    progressMin?: number;
    progressMax?: number;
    sortBy: string;
  }>({
    sortBy: 'joinedAt_desc'
  });

  // Mock course list for filtering
  const courses = [
    { _id: '1', title: 'Introduction to Web Development' },
    { _id: '2', title: 'Advanced JavaScript Concepts' },
    { _id: '3', title: 'React Framework Deep Dive' }
  ];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        
        // Prepare query parameters
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('sortBy', activeFilters.sortBy);
        
        if (searchTerm) params.append('search', searchTerm);
        if (activeFilters.courseId) params.append('courseId', activeFilters.courseId);
        if (activeFilters.progressMin !== undefined) params.append('progressMin', activeFilters.progressMin.toString());
        if (activeFilters.progressMax !== undefined) params.append('progressMax', activeFilters.progressMax.toString());
        
        // This endpoint will need to be implemented in your backend
        const response = await apiGet<{
          success: boolean;
          data: Student[];
          totalPages: number;
        }>(`/educator/students?${params.toString()}`, true);
        
        if (response.success && Array.isArray(response.data)) {
          setStudents(response.data);
          setTotalPages(response.totalPages || 1);
        } else {
          setError('Failed to load student data');
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('An error occurred while fetching students');
        
        // Fallback dummy data for development
        setStudents([
          {
            _id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            enrolledCourses: 3,
            lastActive: '2023-12-10T15:32:00.000Z',
            progress: 78,
            joinedAt: '2023-02-15T08:30:00.000Z'
          },
          {
            _id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            profileImage: 'https://randomuser.me/api/portraits/women/32.jpg',
            enrolledCourses: 2,
            lastActive: '2023-12-12T09:15:00.000Z',
            progress: 65,
            joinedAt: '2023-03-21T12:45:00.000Z'
          },
          {
            _id: '3',
            name: 'Robert Johnson',
            email: 'robert.j@example.com',
            profileImage: 'https://randomuser.me/api/portraits/men/41.jpg',
            enrolledCourses: 1,
            lastActive: '2023-12-13T16:20:00.000Z',
            progress: 32,
            joinedAt: '2023-09-05T10:30:00.000Z'
          },
          {
            _id: '4',
            name: 'Emily Williams',
            email: 'emily.w@example.com',
            enrolledCourses: 2,
            lastActive: '2023-12-11T11:05:00.000Z',
            progress: 91,
            joinedAt: '2023-05-18T14:20:00.000Z'
          },
          {
            _id: '5',
            name: 'Michael Chen',
            email: 'michael.c@example.com',
            profileImage: 'https://randomuser.me/api/portraits/men/29.jpg',
            enrolledCourses: 3,
            lastActive: '2023-12-12T14:30:00.000Z',
            progress: 87,
            joinedAt: '2023-04-12T09:15:00.000Z'
          }
        ]);
        setTotalPages(3);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [searchTerm, currentPage, activeFilters]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleFilterChange = (newFilters: Partial<typeof activeFilters>) => {
    setActiveFilters({...activeFilters, ...newFilters});
    setCurrentPage(1); // Reset to first page on filter change
  };

  const exportStudentData = () => {
    // This would typically generate and download a CSV file
    alert('This would download a CSV of student data');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage students enrolled in your courses
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={exportStudentData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export Data
            </button>
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
              {/* Search */}
              <form onSubmit={handleSearch} className="relative flex-1 max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select
                    value={activeFilters.courseId || ''}
                    onChange={(e) => handleFilterChange({ courseId: e.target.value || undefined })}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Filter by course"
                  >
                    <option value="">All Courses</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <select
                    value={activeFilters.sortBy}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Sort students"
                  >
                    <option value="joinedAt_desc">Newest First</option>
                    <option value="joinedAt_asc">Oldest First</option>
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                    <option value="progress_desc">Highest Progress</option>
                    <option value="progress_asc">Lowest Progress</option>
                    <option value="lastActive_desc">Recently Active</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm 
                  ? "No students match your search criteria." 
                  : "You don't have any enrolled students yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrolled Courses
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Overall Progress
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 relative">
                              {student.profileImage ? (
                                <Image 
                                  src={student.profileImage} 
                                  alt={student.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                <div className="bg-blue-100 rounded-full flex items-center justify-center h-10 w-10">
                                  <span className="text-blue-600 font-medium text-sm">
                                    {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.enrolledCourses}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(student.lastActive)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                              <div 
                                className={`h-2.5 rounded-full ${getProgressColor(student.progress)} ${getProgressWidth(student.progress)}`} 
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {student.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(student.joinedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Link
                            href={`/dashboard/educator/students/${student._id}`}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md inline-flex items-center"
                          >
                            View Details
                          </Link>
                          <a
                            href={`mailto:${student.email}`}
                            className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-md inline-flex items-center"
                            title="Send email"
                          >
                            <EnvelopeIcon className="h-4 w-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      
                      {/* Page numbers would be generated dynamically based on total pages */}
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === i + 1
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 