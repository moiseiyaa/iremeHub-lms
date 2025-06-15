'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  UserIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { apiGet } from '../../../api/apiClient';

interface UserData {
  name: string;
  email: string;
  role: string;
}

interface Course {
  _id: string;
  title: string;
}

interface Enrollment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    profileImage?: {
      url: string;
    };
  };
  course: {
    _id: string;
    title: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  progress: number;
  lastActive: string;
  enrolledAt: string;
}

export default function EnrollmentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch educator's profile to verify they have access
        try {
          const userResponse = await apiGet<{ success: boolean; data: UserData }>('/auth/me', true);
          if (userResponse.success && userResponse.data) {
            if (userResponse.data.role !== 'educator' && userResponse.data.role !== 'admin') {
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
        
        // Mock data for courses and enrollments
        const mockCourses: Course[] = [
          { _id: '1', title: 'Introduction to Web Development' },
          { _id: '2', title: 'Advanced JavaScript' },
          { _id: '3', title: 'React Fundamentals' },
          { _id: '4', title: 'Node.js Backend Development' }
        ];
        
        setCourses(mockCourses);
        
        // Generate mock enrollment data
        const mockEnrollments: Enrollment[] = [
          {
            _id: '1',
            user: {
              _id: '101',
              name: 'John Student',
              email: 'john@example.com',
              profileImage: { url: 'https://randomuser.me/api/portraits/men/1.jpg' }
            },
            course: mockCourses[0],
            status: 'approved',
            progress: 45,
            lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            enrolledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '2',
            user: {
              _id: '102',
              name: 'Jane Learner',
              email: 'jane@example.com'
            },
            course: mockCourses[0],
            status: 'approved',
            progress: 78,
            lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            enrolledAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '3',
            user: {
              _id: '103',
              name: 'Mike Smith',
              email: 'mike@example.com',
              profileImage: { url: 'https://randomuser.me/api/portraits/men/2.jpg' }
            },
            course: mockCourses[1],
            status: 'pending',
            progress: 0,
            lastActive: new Date().toISOString(),
            enrolledAt: new Date().toISOString()
          },
          {
            _id: '4',
            user: {
              _id: '104',
              name: 'Sarah Johnson',
              email: 'sarah@example.com'
            },
            course: mockCourses[2],
            status: 'approved',
            progress: 100,
            lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            enrolledAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '5',
            user: {
              _id: '105',
              name: 'Alex Brown',
              email: 'alex@example.com'
            },
            course: mockCourses[3],
            status: 'rejected',
            progress: 0,
            lastActive: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            enrolledAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        // Apply filters
        let filteredEnrollments = [...mockEnrollments];
        
        if (statusFilter) {
          filteredEnrollments = filteredEnrollments.filter(
            enrollment => enrollment.status === statusFilter
          );
        }
        
        if (courseFilter) {
          filteredEnrollments = filteredEnrollments.filter(
            enrollment => enrollment.course._id === courseFilter
          );
        }
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredEnrollments = filteredEnrollments.filter(
            enrollment => 
              enrollment.user.name.toLowerCase().includes(query) ||
              enrollment.user.email.toLowerCase().includes(query)
          );
        }
        
        setEnrollments(filteredEnrollments);
        setTotalPages(1); // For mock data we'll just set to 1
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setError('Failed to load enrollment data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router, currentPage, statusFilter, courseFilter, searchQuery]);
  
  // Helper functions for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default: return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };
  
  const handleEnrollmentAction = async (enrollmentId: string, action: 'approve' | 'reject') => {
    // For our mock implementation, we'll just update the state directly
    setEnrollments(prev => 
      prev.map(enrollment => 
        enrollment._id === enrollmentId 
          ? { ...enrollment, status: action === 'approve' ? 'approved' : 'rejected' } 
          : enrollment
      )
    );
    
    alert(`Enrollment ${action}d successfully!`);
  };
  
  const resetFilters = () => {
    setStatusFilter(null);
    setCourseFilter(null);
    setSearchQuery('');
    setCurrentPage(1);
  };
  
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading enrollments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Enrollments Management</h1>
          <p className="mt-1 text-gray-500">
            Manage student enrollments across your courses
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {/* Filters and Search */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-500">Filter by status:</span>
            </div>
            <div className="space-x-2">
              <button
                className={`px-3 py-1 text-sm rounded-full ${!statusFilter ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                onClick={() => setStatusFilter(null)}
                aria-label="Show all enrollments"
              >
                All
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-full ${statusFilter === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                onClick={() => setStatusFilter('approved')}
                aria-label="Show approved enrollments"
              >
                Approved
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-full ${statusFilter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                onClick={() => setStatusFilter('pending')}
                aria-label="Show pending enrollments"
              >
                Pending
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-full ${statusFilter === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                onClick={() => setStatusFilter('rejected')}
                aria-label="Show rejected enrollments"
              >
                Rejected
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-500">Filter by course:</span>
            </div>
            <select
              className="block w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={courseFilter || ''}
              onChange={(e) => setCourseFilter(e.target.value || null)}
              aria-label="Select course filter"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
            
            <div className="flex-1 min-w-[300px]">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search by student name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <button 
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
              onClick={resetFilters}
              aria-label="Reset all filters"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Reset Filters
            </button>
          </div>
        </div>
        
        {/* Enrollments Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrolled Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enrollments.length > 0 ? (
                enrollments.map((enrollment) => (
                  <tr key={enrollment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {enrollment.user.profileImage ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={enrollment.user.profileImage.url}
                              alt={enrollment.user.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{enrollment.user.name}</div>
                          <div className="text-sm text-gray-500">{enrollment.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{enrollment.course.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(enrollment.status)}
                        <span className={`ml-1.5 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(enrollment.status)}`}>
                          {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-32 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {enrollment.progress}% complete
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(enrollment.enrolledAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {enrollment.status === 'pending' ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEnrollmentAction(enrollment._id, 'approve')}
                            className="text-green-600 hover:text-green-900 px-2 py-1 bg-green-50 rounded-md"
                            aria-label={`Approve enrollment for ${enrollment.user.name}`}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleEnrollmentAction(enrollment._id, 'reject')}
                            className="text-red-600 hover:text-red-900 px-2 py-1 bg-red-50 rounded-md"
                            aria-label={`Reject enrollment for ${enrollment.user.name}`}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <Link
                          href={`/dashboard/educator/students/${enrollment.user._id}`}
                          className="text-blue-600 hover:text-blue-900"
                          aria-label={`View student profile for ${enrollment.user.name}`}
                        >
                          View Student
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    {searchQuery || statusFilter || courseFilter ? (
                      <div>
                        <p className="text-lg">No enrollments match your filters</p>
                        <button
                          onClick={resetFilters}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Reset filters
                        </button>
                      </div>
                    ) : (
                      <p className="text-lg">No enrollments found</p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 