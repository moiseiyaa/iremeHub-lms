'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiGet } from '../api/apiClient';
import Link from 'next/link';
import { AcademicCapIcon, ArrowDownTrayIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Certificate {
  _id: string;
  certificateId: string;
  course: {
    _id: string;
    title: string;
    category: string;
    level: string;
  };
  issuedAt: string;
  metadata: {
    courseCompletionDate: string;
    grade: string;
    examScore: string | number;
    hoursCompleted: number;
  };
}

export default function CertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/login');
          return;
        }
        
        const response = await apiGet('/certificates', true);
        
        if (response.success) {
          setCertificates(response.data);
        } else {
          setError(response.error || 'Failed to load certificates');
        }
      } catch (err) {
        console.error('Error fetching certificates:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertificates();
  }, [router]);
  
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
          <div className="text-center">
            <div className="text-red-500 text-3xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Your Certificates</h1>
          <p className="mt-2 text-lg text-gray-600">
            Showcase your achievements and completed courses
          </p>
        </div>
        
        {certificates.length === 0 ? (
          <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-8 text-center">
            <AcademicCapIcon className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Yet</h2>
            <p className="text-gray-600 mb-6">
              Complete courses to earn certificates and showcase your achievements.
            </p>
            <Link
              href="/courses"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {certificates.map((certificate) => (
              <div key={certificate._id} className="bg-white shadow-md rounded-lg overflow-hidden">
                {/* Certificate header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8 text-white relative">
                  <div className="absolute top-4 right-4 bg-white/20 rounded-full p-2">
                    <CheckCircleIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{certificate.course.title}</h3>
                  <p className="opacity-80 text-sm">
                    {certificate.course.category} • {certificate.course.level}
                  </p>
                </div>
                
                {/* Certificate details */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {new Date(certificate.issuedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {certificate.metadata.grade}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exam Score:</span>
                      <span className="font-medium">
                        {typeof certificate.metadata.examScore === 'number' 
                          ? `${certificate.metadata.examScore}%` 
                          : certificate.metadata.examScore}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed:</span>
                      <span className="font-medium">
                        {new Date(certificate.metadata.courseCompletionDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hours:</span>
                      <span className="font-medium">{certificate.metadata.hoursCompleted}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/courses/${certificate.course._id}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      View Course
                    </Link>
                    <a
                      href={`/api/v1/certificates/${certificate.certificateId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm font-medium bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md hover:bg-indigo-100"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 