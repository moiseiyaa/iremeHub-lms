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

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFilter = searchParams ? searchParams.get('role') : null;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string | null>(roleFilter);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Note: This API endpoint is likely not implemented yet
        // In production, you'd have a real endpoint like:
        // const response = await apiGet(`/admin/users?page=${currentPage}&role=${activeFilter || ''}`, true);
        
        // For now, we'll use mock data
        // In a real implementation, we would fetch from the backend
        const mockUsers: UserData[] = [
          {
            _id: '1',
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
            createdAt: new Date().toISOString(),
            profileImage: { url: 'https://randomuser.me/api/portraits/men/1.jpg' }
          },
          {
            _id: '2',
            name: 'Educator Smith',
            email: 'educator@example.com',
            role: 'educator',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '3',
            name: 'John Student',
            email: 'student1@example.com',
            role: 'student',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '4',
            name: 'Jane Student',
            email: 'student2@example.com',
            role: 'student',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            profileImage: { url: 'https://randomuser.me/api/portraits/women/2.jpg' }
          },
          {
            _id: '5',
            name: 'Michael Educator',
            email: 'educator2@example.com',
            role: 'educator',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        // Filter users if a role filter is active
        const filteredUsers = activeFilter 
          ? mockUsers.filter(user => user.role === activeFilter)
          : mockUsers;
          
        setUsers(filteredUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentPage, activeFilter]);
  
  // Set the active filter from URL params
  useEffect(() => {
    setActiveFilter(roleFilter);
  }, [roleFilter]);
  
  // Helper to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Helper to get role badge color
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
  
  const applyFilter = (role: string | null) => {
    // Update URL with the filter
    if (role) {
      router.push(`/dashboard/admin/users?role=${role}`);
    } else {
      router.push('/dashboard/admin/users');
    }
    setActiveFilter(role);
    setCurrentPage(1);
  };
  
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="mt-1 text-gray-500">
              Manage all platform users
            </p>
          </div>
          <Link 
            href="/dashboard/admin/users/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add User
          </Link>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-500">Filter by:</span>
          <div className="space-x-2">
            <button
              className={`px-3 py-1 text-sm rounded-full ${!activeFilter ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              onClick={() => applyFilter(null)}
            >
              All
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              onClick={() => applyFilter('admin')}
            >
              Admins
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'educator' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              onClick={() => applyFilter('educator')}
            >
              Educators
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'student' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              onClick={() => applyFilter('student')}
            >
              Students
            </button>
          </div>
          <button 
            className="ml-auto text-sm text-gray-600 hover:text-gray-900 flex items-center"
            onClick={() => {
              setCurrentPage(1);
              setActiveFilter(null);
              router.push('/dashboard/admin/users');
            }}
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Reset
          </button>
        </div>
        
        {/* Users Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
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
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.profileImage ? (
                          <Image
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.profileImage.url}
                            alt={user.name}
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link 
                        href={`/dashboard/admin/users/${user._id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                        aria-label={`Edit user ${user.name}`}
                        title={`Edit user ${user.name}`}
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </Link>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => {
                          // You'd implement confirmation and deletion logic here
                          alert(`Delete user ${user.name} - This would be a confirmation modal`);
                        }}
                        aria-label={`Delete user ${user.name}`}
                        title={`Delete user ${user.name}`}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
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