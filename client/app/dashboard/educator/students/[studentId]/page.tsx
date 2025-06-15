'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiGet } from '../../../../api/apiClient'; // Corrected path
import { UserIcon, BookOpenIcon, AcademicCapIcon, ArrowLeftIcon, XCircleIcon } from '@heroicons/react/24/outline'; // Added XCircleIcon

interface StudentDetails {
  _id: string;
  name: string;
  email: string;
  profileImage?: { url: string };
  createdAt: string; // Date student account was created
  // Add any other student-specific fields you might have, e.g., bio
}

interface EnrolledCourse {
  _id: string;
  title: string;
  category?: string;
  progress: number; // Overall progress percentage
  completed: boolean;
  enrolledAt: string; // Date student enrolled in this course
  completedAt?: string; // Date student completed this course
  // Potentially add a link to the course itself
  courseId: string; 
}

interface StudentPageData {
  student: StudentDetails;
  courses: EnrolledCourse[];
}

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params?.studentId as string | undefined; // Handle potentially null params

  const [studentData, setStudentData] = useState<StudentPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentId) {
      const fetchStudentData = async () => {
        setLoading(true);
        setError(null);
        try {
          // Correct the generic type for apiGet and adjust response handling
          const response = await apiGet<StudentPageData>(`/educator/students/${studentId}`);
          
          if (response && response.success && response.data) {
            setStudentData(response.data);
          } else {
            // Use error message from response if available, otherwise a default
            const errorMessage = response?.error || 'Failed to load student data.'; 
            setError(errorMessage);
            console.error('API error for student details:', response);
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(`An error occurred while fetching student data: ${err.message}`);
          } else {
            setError('An unknown error occurred while fetching student data.');
          }
          console.error('Fetch error for student details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchStudentData();
    }
  }, [studentId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link href="/dashboard/educator/enrollments" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto w-fit">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Enrollments
          </Link>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-50 p-4">
         <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Student Not Found</h2>
          <p className="text-gray-600 mb-6">The details for this student could not be retrieved.</p>
          <Link href="/dashboard/educator/enrollments" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto w-fit">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Enrollments
          </Link>
        </div>
      </div>
    );
  }

  const { student, courses } = studentData;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header and Back Button */}
        <div className="mb-6">
          <Link href="/dashboard/educator/enrollments" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Enrollments
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
        </div>

        {/* Student Information Card */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center">
              {student.profileImage ? (
                <img 
                  className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover ring-4 ring-blue-100 mb-4 sm:mb-0 sm:mr-8" 
                  src={student.profileImage.url} 
                  alt={student.name} 
                />
              ) : (
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-gray-200 flex items-center justify-center ring-4 ring-blue-100 mb-4 sm:mb-0 sm:mr-8">
                  <UserIcon className="h-16 w-16 text-gray-500" />
                </div>
              )}
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{student.name}</h2>
                <p className="text-md text-gray-600 mt-1">{student.email}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Member since: {formatDate(student.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Courses Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <AcademicCapIcon className="h-7 w-7 mr-2 text-blue-600" />
            Enrolled Courses
          </h2>
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div key={course._id} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-3">
                    <BookOpenIcon className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-gray-800 truncate" title={course.title}>
                      <Link href={`/courses/${course.courseId}`} className="hover:text-blue-600">
                        {course.title}
                      </Link>
                    </h3>
                  </div>
                  {course.category && (
                    <p className="text-xs text-gray-500 mb-1">Category: {course.category}</p>
                  )}
                  <p className="text-sm text-gray-600 mb-1">Enrolled: {formatDate(course.enrolledAt)}</p>
                  
                  <div className="my-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">Progress</span>
                      <span className="text-xs font-medium text-blue-700">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {course.completed ? (
                    <p className="text-sm text-green-600 font-medium">
                      Completed on: {formatDate(course.completedAt || '')}
                    </p>
                  ) : (
                    <p className="text-sm text-yellow-600 font-medium">In Progress</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-8 text-center">
              <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">This student is not currently enrolled in any of your courses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 