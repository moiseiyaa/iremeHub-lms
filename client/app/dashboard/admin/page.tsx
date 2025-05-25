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
  ChartBarIcon,
  NewspaperIcon,
  ArrowRightOnRectangleIcon,
  ArrowSmallRightIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { apiGet } from '../../api/apiClient';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: {
    url: string;
  };
  createdAt: string;
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
      setLoading(true);
      setError(''); // Clear previous errors
      try {
        // Fetch user profile first
        const userResponse = await apiGet<{ success: boolean; data: UserData; error?: string }>('/auth/me', true);
        if (userResponse.success && userResponse.data) {
          if (userResponse.data.role !== 'admin') {
            router.push('/dashboard'); 
            return;
          }
          setUser(userResponse.data);
        } else if (process.env.NODE_ENV === 'development' && !userResponse.success) {
          // Fallback to mock user only if /auth/me fails in dev and there was an actual error from apiGet
          console.warn('Dev mode: Using mock admin user for dashboard as /auth/me failed.');
          setUser({
            _id: 'mockadminid_dev',
            name: 'Dev Admin User',
            email: 'admin-dev@example.com',
            role: 'admin',
            avatar: { url: 'https://i.pravatar.cc/150?u=devadmin' },
            createdAt: new Date().toISOString(),
          });
        } else {
          throw new Error(userResponse.error || 'Failed to fetch user data or user is not admin.');
        }

        // Fetch dashboard stats if user is confirmed or mocked admin
        if (userResponse.data?.role === 'admin' || (process.env.NODE_ENV === 'development' && user?.role === 'admin')) {
          const statsResponse = await apiGet<{ success: boolean; data: AdminStats; error?: string }>('/admin/dashboard-stats', true);
          if (statsResponse.success && statsResponse.data) {
            setStats(statsResponse.data);
          } else {
            // Don't throw critical error for stats, maybe show partial data or a warning
            console.warn('Could not fetch admin dashboard stats:', statsResponse.error || 'No data returned');
            setError('Could not load all dashboard statistics. Some data may be missing.'); // Non-blocking error
          }
        }

      } catch (err: unknown) {
        console.error('Admin dashboard setup error:', err);
        let errorMessage = 'Failed to load admin dashboard data';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        // If the error is critical (like auth failure), redirect
        if (err instanceof Error && (errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('token'))) {
            localStorage.removeItem('token');
            router.push('/login');
            return; // Ensure no further processing after redirect
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]); // Removed user from dependencies to avoid re-fetch loop if only stats fail

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const getRoleBadgeColor = (role: string) => {
    if (role === 'admin') return 'bg-purple-100 text-purple-800';
    if (role === 'educator') return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };
  const getBlogStatusBadgeColor = (status: string) => status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div><p className="ml-4 text-slate-700">Loading Dashboard...</p></div>;
  }
  if (error) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-red-600"><p>Error: {error}</p><Link href="/login" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Go to Login</Link></div>;
  }
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting to login...</div>;
  }

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: ChartBarIcon, current: activeTab === 'dashboard' },
    { name: 'Users', href: '/dashboard/admin/users', icon: UserGroupIcon, current: activeTab === 'users' },
    { name: 'Courses', href: '/dashboard/admin/courses', icon: AcademicCapIcon, current: activeTab === 'courses' },
    { name: 'Blogs', href: '/dashboard/admin/blogs', icon: NewspaperIcon, current: activeTab === 'blogs' },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: Cog6ToothIcon, current: activeTab === 'settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-slate-800 text-slate-100 flex flex-col shadow-lg z-30`}>
        <div className="flex items-center justify-center h-20 border-b border-slate-700">
          <Image src="/images/iremehub-logo-white.svg" alt="IremeHub Logo" width={150} height={40} />
        </div>
        <div className="text-center py-5 border-b border-slate-700">
          <Image 
            src={user.avatar?.url || `https://i.pravatar.cc/150?u=${user.email}`}
            alt={user.name} 
            width={72} 
            height={72} 
            className="rounded-full mx-auto border-2 border-slate-500 object-cover"
          />
          <h2 className="mt-2.5 text-lg font-semibold">{user.name}</h2>
          <p className="text-xs text-slate-300">{user.email}</p>
        </div>
        
        <nav className="flex-grow p-4 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => { setActiveTab(item.name.toLowerCase()); setSidebarOpen(false); }}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors ${
                item.current ? 'bg-slate-900 text-white shadow-md' : 'text-slate-200'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout} 
            className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-md text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors text-left"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white shadow-sm p-4 md:hidden sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="text-slate-600 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {sidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
            <h1 className="text-xl font-semibold text-slate-800 capitalize">
              {activeTab}
            </h1>
            <div></div>
          </div>
        </header>

        <main className="flex-1 p-6 bg-slate-100">
          {activeTab === 'dashboard' && (
            <>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-6 hidden md:block">Admin Dashboard</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Users</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalUsers}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <UserGroupIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <Link href="/dashboard/admin/users" className="mt-4 text-xs text-blue-600 hover:underline flex items-center">
                    View all users <ArrowSmallRightIcon className="ml-1 h-3 w-3" />
                  </Link>
                </div>
                <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Students</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalStudents}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <UserIcon className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Educators</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalEducators}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <AcademicCapIcon className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Courses</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalCourses}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <NewspaperIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <Link href="/dashboard/admin/courses" className="mt-4 text-xs text-blue-600 hover:underline flex items-center">
                    Manage courses <ArrowSmallRightIcon className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Users</h2>
                  <ul className="space-y-3">
                    {stats.recentUsers.slice(0, 5).map(u => (
                      <li key={u._id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-md">
                        <div className="flex items-center">
                          <Image src={`https://i.pravatar.cc/150?u=${u.email}`} alt={u.name} width={40} height={40} className="rounded-full object-cover mr-3" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeColor(u.role)}`}>{u.role}</span>
                            <p className="text-xs text-slate-400 mt-1">Joined {formatDate(u.createdAt)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">Recent Blog Posts</h2>
                    <Link href="/dashboard/admin/blogs/new" className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
                      New Blog Post
                    </Link>
                  </div>
                  <ul className="space-y-3">
                    {stats.recentBlogs.slice(0, 5).map(blog => (
                      <li key={blog._id} className="p-3 hover:bg-slate-50 rounded-md">
                        <Link href={`/dashboard/admin/blogs/edit/${blog._id}`} className="block">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-sm font-medium text-slate-700 hover:text-blue-600">{blog.title}</h3>
                              <p className="text-xs text-slate-500">By {blog.author} - Created {formatDate(blog.createdAt)}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getBlogStatusBadgeColor(blog.status)}`}>{blog.status}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
          {activeTab !== 'dashboard' && (
            <div className="bg-white p-6 rounded-xl shadow">
              <h1 className="text-xl font-semibold text-slate-800 capitalize">{activeTab} Management</h1>
              <p className="mt-4 text-slate-600">Content for the {activeTab} section will go here.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 