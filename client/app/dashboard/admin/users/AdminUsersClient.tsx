'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  UserIcon,
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: {
    url: string;
  };
  createdAt: string;
}

export default function AdminUsersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFilter = searchParams?.get('role') ?? null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string | null>(roleFilter);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // TODO: replace mock with real API call
        const mockUsers: UserData[] = [
          {
            _id: '1',
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
            createdAt: new Date().toISOString(),
            profileImage: { url: 'https://randomuser.me/api/portraits/men/1.jpg' },
          },
          {
            _id: '2',
            name: 'Educator Smith',
            email: 'educator@example.com',
            role: 'educator',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: '3',
            name: 'John Student',
            email: 'student1@example.com',
            role: 'student',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: '4',
            name: 'Jane Student',
            email: 'student2@example.com',
            role: 'student',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            profileImage: { url: 'https://randomuser.me/api/portraits/women/2.jpg' },
          },
          {
            _id: '5',
            name: 'Michael Educator',
            email: 'educator2@example.com',
            role: 'educator',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];

        const filtered = activeFilter ? mockUsers.filter((u) => u.role === activeFilter) : mockUsers;
        setUsers(filtered);
        setTotalPages(1);
      } catch (err) {
        console.error(err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [activeFilter, currentPage]);

  useEffect(() => {
    setActiveFilter(roleFilter);
  }, [roleFilter]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'educator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  const applyFilter = (role: string | null) => {
    router.push(role ? `/dashboard/admin/users?role=${role}` : '/dashboard/admin/users');
    setActiveFilter(role);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading users…</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="mt-1 text-gray-500">Manage all platform users</p>
          </div>
          <Link
            href="/dashboard/admin/users/create"
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" /> Add User
          </Link>
        </div>

        {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-500">Filter by:</span>
          {['admin', 'educator', 'student'].map((role) => (
            <button
              key={role}
              onClick={() => applyFilter(role)}
              className={`px-3 py-1 text-sm rounded-full ${
                activeFilter === role ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
          <button className="ml-auto text-sm text-gray-600 hover:text-gray-900" onClick={() => applyFilter(null)}>
            <ArrowPathIcon className="h-4 w-4 mr-1 inline" /> Reset
          </button>
        </div>

        {/* Users table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-3">
                    {u.profileImage ? (
                      <Image src={u.profileImage.url} alt={u.name} width={40} height={40} className="rounded-full" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{u.name}</div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(u.role)}`}>{
                      u.role
                    }</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link href={`/dashboard/admin/users/${u._id}/edit`} className="text-blue-600 hover:text-blue-900">
                      <PencilSquareIcon className="h-5 w-5" title="Edit" />
                    </Link>
                    <button
                      onClick={() => alert(`Delete user ${u.name}`)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" title="Delete" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
