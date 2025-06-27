'use client';

import React, { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '../../../api/apiClient';
import Image from 'next/image';

interface RequestItem {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  courseId: {
    _id: string;
    title: string;
  };
  studentId: {
    _id: string;
    name: string;
    avatar?: { url: string };
    email?: string;
  };
  createdAt: string;
}

const RequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await apiGet<{ data: RequestItem[] }>('/educator/requests', true);
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDecision = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await apiPatch(`/educator/requests/${id}`, { status }, true);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      alert('Action failed');
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Enrollment Requests</h1>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested At
                </th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req._id}>
                  <td className="px-4 py-2 flex items-center space-x-2">
                    {req.studentId.avatar?.url && (
                      <Image
                        src={req.studentId.avatar.url}
                        alt={req.studentId.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )}
                    <span>{req.studentId.name}</span>
                  </td>
                  <td className="px-4 py-2">{req.courseId.title}</td>
                  <td className="px-4 py-2">
                    {new Date(req.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleDecision(req._id, 'approved')}
                      className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-500"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecision(req._id, 'rejected')}
                      className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-500"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RequestsPage;
