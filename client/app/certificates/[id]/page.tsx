'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet } from '../../api/apiClient';
import { 
  AcademicCapIcon, 
  ArrowLeftIcon, 
  ArrowDownTrayIcon, 
  CheckBadgeIcon, 
  ClockIcon,
  CalendarIcon,
  UserCircleIcon,
  DocumentTextIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

interface Certificate {
  _id: string;
  certificateId: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  course: {
    _id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    instructor: {
      _id: string;
      name: string;
      email: string;
    };
  };
  issuedAt: string;
  metadata: {
    courseCompletionDate: string;
    grade: string;
    examScore: string | number;
    hoursCompleted: number;
  };
}

export default function CertificateDetailPage({ params }: { params: { id: string } }) {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<{
    isVerifying: boolean;
    isValid?: boolean;
    message?: string;
  }>({ isVerifying: false });

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        
        const response = await apiGet(`/certificates/${params.id}`, true);
        
        if (response.success) {
          setCertificate(response.data);
        } else {
          setError(response.error || 'Failed to load certificate');
        }
      } catch (err) {
        console.error('Error fetching certificate:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertificate();
  }, [params.id]);
  
  const verifyCertificate = async () => {
    try {
      setVerificationStatus({ isVerifying: true });
      
      const response = await apiGet(`/certificates/${params.id}/verify`);
      
      if (response.success) {
        setVerificationStatus({
          isVerifying: false,
          isValid: response.isValid,
          message: response.message
        });
      } else {
        setVerificationStatus({
          isVerifying: false,
          isValid: false,
          message: response.error || 'Verification failed'
        });
      }
    } catch (err) {
      console.error('Error verifying certificate:', err);
      setVerificationStatus({
        isVerifying: false,
        isValid: false,
        message: 'Verification failed. Please try again.'
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }
  
  if (error || !certificate) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
          <div className="text-center">
            <div className="text-red-500 text-3xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The certificate you are looking for does not exist or is no longer available.'}</p>
            <Link
              href="/certificates"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Certificates
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/certificates"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Certificates
          </Link>
        </div>
        
        {/* Certificate Card */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="relative">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-48 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <AcademicCapIcon className="h-16 w-16 mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Certificate of Completion</h1>
                <p className="mt-1 text-white/80">ID: {certificate.certificateId}</p>
              </div>
            </div>
            
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-2 border-4 border-indigo-100 shadow-md">
              <div className="bg-indigo-500 rounded-full w-16 h-16 flex items-center justify-center">
                <CheckBadgeIcon className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="pt-16 pb-8 px-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">
                This is to certify that
              </h2>
              <p className="mt-2 text-2xl font-bold text-indigo-600">
                {certificate.user.name}
              </p>
              <p className="mt-2 text-gray-600">
                has successfully completed
              </p>
              <h3 className="mt-2 text-xl font-bold text-gray-900">
                {certificate.course.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {certificate.course.category} • {certificate.course.level}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-start">
                  <CalendarIcon className="h-6 w-6 text-indigo-500 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Issued On</h4>
                    <p className="text-gray-600">
                      {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <UserCircleIcon className="h-6 w-6 text-indigo-500 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Instructor</h4>
                    <p className="text-gray-600">
                      {certificate.course.instructor.name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <DocumentTextIcon className="h-6 w-6 text-indigo-500 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Grade Achieved</h4>
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-indigo-600 mr-2">
                        {certificate.metadata.grade}
                      </span>
                      <span className="text-gray-600">
                        ({typeof certificate.metadata.examScore === 'number' 
                          ? `${certificate.metadata.examScore}%` 
                          : certificate.metadata.examScore})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <ClockIcon className="h-6 w-6 text-indigo-500 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Completion Date</h4>
                    <p className="text-gray-600">
                      {new Date(certificate.metadata.courseCompletionDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <BuildingLibraryIcon className="h-6 w-6 text-indigo-500 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Course Duration</h4>
                    <p className="text-gray-600">
                      {certificate.metadata.hoursCompleted} hours
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckBadgeIcon className="h-6 w-6 text-indigo-500 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Certificate Status</h4>
                    <p className="text-green-600 font-medium">Valid</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Course Description */}
            <div className="bg-indigo-50 p-4 rounded-md mb-8">
              <h4 className="font-medium text-gray-900 mb-2">Course Description</h4>
              <p className="text-gray-600 text-sm">{certificate.course.description}</p>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                onClick={verifyCertificate}
                disabled={verificationStatus.isVerifying}
                className="inline-flex items-center px-4 py-2 bg-white border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 w-full sm:w-auto justify-center"
              >
                {verificationStatus.isVerifying ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-indigo-600 border-r-2 rounded-full"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckBadgeIcon className="h-5 w-5 mr-2" />
                    Verify Certificate
                  </>
                )}
              </button>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <a
                  href={`/api/v1/certificates/${certificate.certificateId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 w-full sm:w-auto justify-center"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  Download
                </a>
                
                <Link
                  href={`/courses/${certificate.course._id}`}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 w-full sm:w-auto justify-center"
                >
                  View Course
                </Link>
              </div>
            </div>
            
            {/* Verification Results */}
            {verificationStatus.isValid !== undefined && (
              <div className={`mt-6 p-4 rounded-md ${
                verificationStatus.isValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {verificationStatus.isValid ? (
                      <CheckBadgeIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">
                      {verificationStatus.isValid ? 'Certificate is Valid' : 'Certificate Verification Failed'}
                    </h3>
                    <div className="mt-1 text-sm">
                      <p>{verificationStatus.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}