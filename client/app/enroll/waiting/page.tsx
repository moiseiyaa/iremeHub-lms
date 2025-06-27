'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const WaitingApproval: React.FC = () => {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const params = useSearchParams();
  const courseId = params.get('course');

  // Close dialog when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        router.back();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={dialogRef}
        className="bg-white max-w-sm w-full rounded-lg shadow-lg p-6 text-center space-y-4"
      >
        <h2 className="text-xl font-semibold text-slate-800">Enrollment Request Sent</h2>
        <p className="text-slate-600 text-sm">
          Your request to enroll in this course has been sent. Please wait for the educator to
          approve it. You&apos;ll receive a notification once a decision is made.
        </p>
        <button
          onClick={() => router.push(`/courses/${courseId ?? ''}`)}
          className="mt-4 inline-flex justify-center rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Back to Course
        </button>
      </div>
    </div>
  );
};

export default WaitingApproval;
