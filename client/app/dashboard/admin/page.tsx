'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  UserGroupIcon, 
  AcademicCapIcon, 
  Cog6ToothIcon,
  UserIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  NewspaperIcon,
  ArrowRightOnRectangleIcon,
  ArrowSmallRightIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { apiGet } from '../../api/apiClient';

interface UserData {
  name: string;
  email: string;
  role: string;
  avatar?: {
    url: string;
  };
}

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEducators: number;
  totalStudents: number;
  activeUsers: number;
  totalBlogs: number;
  recentUsers: SimplifiedUser[];
  recentBlogs: SimplifiedBlog[];
}

interface SimplifiedUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface SimplifiedBlog {
  _id: string;
  title: string;
  author: string;
  status: 'draft' | 'published';
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<UserData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEducators: 0,
    totalStudents: 0,
    activeUsers: 0,
    totalBlogs: 0,
    recentUsers: [],
    recentBlogs: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        try {
          const userResponse = await apiGet<{ success: boolean; data: UserData }>('/auth/me', true);
          if (userResponse.success && userResponse.data) {
            const userData = userResponse.data;
            setUser(userData);
            
            // Check if user is an admin
            if (userData.role !== 'admin') {
              console.log('User is not an admin, redirecting');
              router.push('/dashboard');
              return;
            } else {
              console.log('Admin user confirmed, loading dashboard');
            }
          } else if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Creating mock admin user for dashboard');
            // Set mock user for development
            setUser({
              _id: '60d0fe4f5311236168a109ca',
              name: 'Test Admin',
              email: 'test@example.com',
              role: 'admin',
              createdAt: new Date().toISOString()
            });
            // Continue loading dashboard
          } else {
            throw new Error('Failed to get user data');
          }
        } catch (userErr) {
          console.error('User fetch error:', userErr);
          
          // Special handling for development mode
          if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Creating mock admin user after error');
            // Set mock user for development despite error
            setUser({
              _id: '60d0fe4f5311236168a109ca',
              name: 'Test Admin (Error)',
              email: 'test@example.com',
              role: 'admin',
              createdAt: new Date().toISOString()
            });
            // Continue loading dashboard despite error
          } else {
            localStorage.removeItem('token');
            router.push('/login');
            return;
          }
        }
        
        // For now, let's use mocked admin stats as our endpoint might not exist yet
        // In a real implementation, you would have an API endpoint like /admin/dashboard-stats
        const mockAdminStats: AdminStats = {
          totalUsers: 156,
          totalCourses: 48,
          totalEducators: 12,
          totalStudents: 142,
          activeUsers: 87,
          totalBlogs: 24,
          recentUsers: [
            {
              _id: '1',
              name: 'Jane Smith',
              email: 'jane@example.com',
              role: 'student',
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              _id: '2',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'educator',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              _id: '3',
              name: 'Alex Johnson',
              email: 'alex@example.com',
              role: 'student',
              createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              _id: '4',
              name: 'Maria Garcia',
              email: 'maria@example.com',
              role: 'educator',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          recentBlogs: [
            {
              _id: 'b1',
              title: 'How to Master Online Learning',
              author: 'John Doe',
              status: 'published',
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              _id: 'b2',
              title: 'The Future of Education Technology',
              author: 'Maria Garcia',
              status: 'published',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              _id: 'b3',
              title: 'Tips for Effective Teaching',
              author: 'Jane Smith',
              status: 'draft',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        };
        
        setStats(mockAdminStats);
      } catch (err) {
        console.error('Admin dashboard error:', err);
        setError('Failed to load admin dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router]);

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

  // Helper to get blog status badge color
  const getBlogStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Sidebar menu items
  const menuItems = [
    { name: 'Dashboard', icon: ChartBarIcon, href: '/dashboard/admin', active: activeTab === 'dashboard' },
    { name: 'Users', icon: UserGroupIcon, href: '/dashboard/admin/users', active: activeTab === 'users' },
    { name: 'Courses', icon: AcademicCapIcon, href: '/dashboard/admin/courses', active: activeTab === 'courses' },
    { name: 'Blogs', icon: NewspaperIcon, href: '/dashboard/admin/blogs', active: activeTab === 'blogs' },
    { name: 'Settings', icon: Cog6ToothIcon, href: '/dashboard/admin/settings', active: activeTab === 'settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:inset-0`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
                <AcademicCapIcon className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xl font-bold">IremeHub Admin</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="text-white lg:hidden"
              aria-label="Close sidebar menu"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Profile section */}
          <div className="flex flex-col items-center border-b border-blue-500 pb-6 pt-2">
            <div className="h-16 w-16 rounded-full bg-white p-1">
              {user?.avatar?.url ? (
                <Image 
                  src={user.avatar.url} 
                  alt={user.name} 
                  width={64} 
                  height={64} 
                  className="rounded-full h-full w-full object-cover" 
                />
              ) : (
                <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-blue-600" />
                </div>
              )}
            </div>
            <h3 className="mt-2 text-sm font-medium">{user?.name || 'Admin User'}</h3>
            <p className="text-xs text-blue-200">{user?.email || 'admin@example.com'}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  item.active
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
                onClick={() => {
                  setActiveTab(item.name.toLowerCase());
                  setSidebarOpen(false);
                }}
              >
                <item.icon className={`mr-3 h-5 w-5 ${
                  item.active ? 'text-white' : 'text-blue-300 group-hover:text-white'
                }`} />
                {item.name}
                {item.active && (
                  <div className="ml-auto w-1.5 h-8 bg-white rounded-full"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="px-4 py-6">
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/login');
              }}
              className="flex w-full items-center px-4 py-3 text-sm font-medium rounded-lg text-white hover:bg-blue-700 transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-blue-300" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm flex items-center h-16 px-4 lg:px-6 z-10">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="text-gray-500 lg:hidden"
            aria-label="Open sidebar menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 ml-4 lg:ml-0">Admin Dashboard</h1>
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            <button 
              className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative"
              aria-label="View notifications"
            >
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <button 
              className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative"
              aria-label="View messages"
            >
              <EnvelopeIcon className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                  <UserGroupIcon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Total Users</p>
                  <p className="text-lg font-semibold">{stats.totalUsers}</p>
                </div>
              </div>
              <Link href="/dashboard/admin/users" className="flex items-center mt-4 text-xs text-blue-600 font-medium">
                View details
                <ArrowSmallRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-50 text-green-600">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Total Students</p>
                  <p className="text-lg font-semibold">{stats.totalStudents}</p>
                </div>
              </div>
              <Link href="/dashboard/admin/users?role=student" className="flex items-center mt-4 text-xs text-green-600 font-medium">
                View details
                <ArrowSmallRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                  <ShieldCheckIcon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Total Educators</p>
                  <p className="text-lg font-semibold">{stats.totalEducators}</p>
                </div>
              </div>
              <Link href="/dashboard/admin/users?role=educator" className="flex items-center mt-4 text-xs text-purple-600 font-medium">
                View details
                <ArrowSmallRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
                  <AcademicCapIcon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Total Courses</p>
                  <p className="text-lg font-semibold">{stats.totalCourses}</p>
                </div>
              </div>
              <Link href="/dashboard/admin/courses" className="flex items-center mt-4 text-xs text-yellow-600 font-medium">
                View details
                <ArrowSmallRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-pink-50 text-pink-600">
                  <NewspaperIcon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Total Blogs</p>
                  <p className="text-lg font-semibold">{stats.totalBlogs}</p>
                </div>
              </div>
              <Link href="/dashboard/admin/blogs" className="flex items-center mt-4 text-xs text-pink-600 font-medium">
                View details
                <ArrowSmallRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 transform transition-all duration-200 hover:shadow-md hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                  <UserGroupIcon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Active Users</p>
                  <p className="text-lg font-semibold">{stats.activeUsers}</p>
                </div>
              </div>
              <Link href="/dashboard/admin/analytics" className="flex items-center mt-4 text-xs text-indigo-600 font-medium">
                View details
                <ArrowSmallRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Content sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Users</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {stats.recentUsers.map((user) => (
                  <div key={user._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">{user.name}</p>
                      <div className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {user.email}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Joined {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
                <Link 
                  href="/dashboard/admin/users" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all users
                </Link>
              </div>
            </div>

            {/* Recent Blogs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Blog Posts</h3>
                <Link 
                  href="/dashboard/admin/blogs/create" 
                  className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  New Blog
                </Link>
              </div>
              <div className="divide-y divide-gray-200">
                {stats.recentBlogs.map((blog) => (
                  <div key={blog._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">{blog.title}</p>
                      <div className={`px-2 py-1 text-xs rounded-full ${getBlogStatusBadgeColor(blog.status)}`}>
                        {blog.status}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <UserIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {blog.author}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Created {formatDate(blog.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
                <Link 
                  href="/dashboard/admin/blogs" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all blogs
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 