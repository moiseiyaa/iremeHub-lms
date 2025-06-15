

export const dynamic = 'force-dynamic';


import { Suspense } from 'react';
import AdminUsersClient from './AdminUsersClient';




/* interface moved to client component */
// ---- remove rest of file below ----
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
  return <AdminUsersClient />;
}

// --- Client component moved to separate file ---

  return (
    <Suspense fallback={<div className="p-6">Loading users...</div>}>
      <UsersPageContent />
    </Suspense>
  );
}

/* Client component removed */
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
        setTotalPages(1); // Mock value, would come from API
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
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
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
              title="All users"
            >
              All
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              onClick={() => applyFilter('admin')}
              title="Admin users"
            >
              Admins
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'educator' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              onClick={() => applyFilter('educator')}
              title="Educator users"
            >
              Educators
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full ${activeFilter === 'student' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              onClick={() => applyFilter('student')}
              title="Student users"
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
            title="Reset filters"
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
                      >
                        <PencilSquareIcon className="h-5 w-5" title="Edit" />
                      </Link>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => {
                          // You'd implement confirmation and deletion logic here
                          alert(`Delete user ${user.name} - This would be a confirmation modal`);
                        }}
                      >
                        <TrashIcon className="h-5 w-5" title="Delete" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, users.length)}
                    </span>{' '}
                    of <span className="font-medium">{users.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                      aria-label="Previous page"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Page numbers would go here */}
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                      aria-label="Next page"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 