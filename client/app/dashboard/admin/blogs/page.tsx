'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  NewspaperIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  EyeIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    _id: string;
    avatar?: {
      url: string;
    };
  };
  featuredImage?: {
    url: string;
  };
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  readTime: number;
}

export default function AdminBlogsPage() {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const blogsPerPage = 10;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would call your actual API endpoint
        // const response = await fetch('/api/v1/admin/blogs');
        // const data = await response.json();
        // if (data.success) {
        //   setBlogs(data.data);
        //   setTotalPages(Math.ceil(data.data.length / blogsPerPage));
        // }
        
        // For demonstration purposes, we're using mock data
        const mockBlogs: Blog[] = [
          {
            _id: '1',
            title: 'Getting Started with Online Learning',
            slug: 'getting-started-with-online-learning',
            excerpt: 'Tips and strategies for successful online education',
            content: 'Full content here...',
            author: {
              _id: 'author1',
              name: 'John Smith',
              avatar: {
                url: 'https://i.pravatar.cc/150?img=1'
              }
            },
            featuredImage: {
              url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8'
            },
            category: 'Education',
            tags: ['online learning', 'education', 'tips'],
            status: 'published',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            readTime: 5
          },
          {
            _id: '2',
            title: 'The Future of Educational Technology',
            slug: 'future-of-educational-technology',
            excerpt: 'Exploring emerging trends in edtech',
            content: 'Full content here...',
            author: {
              _id: 'author2',
              name: 'Maria Garcia',
              avatar: {
                url: 'https://i.pravatar.cc/150?img=5'
              }
            },
            featuredImage: {
              url: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f'
            },
            category: 'Technology',
            tags: ['edtech', 'future', 'technology'],
            status: 'published',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            readTime: 7
          },
          {
            _id: '3',
            title: 'Effective Teaching Methods for Virtual Classrooms',
            slug: 'effective-teaching-methods-virtual-classrooms',
            excerpt: 'Best practices for educators in online environments',
            content: 'Full content here...',
            author: {
              _id: 'author3',
              name: 'Robert Johnson',
              avatar: {
                url: 'https://i.pravatar.cc/150?img=3'
              }
            },
            featuredImage: {
              url: 'https://images.unsplash.com/photo-1610484826967-09c5720778c7'
            },
            category: 'Teaching',
            tags: ['teaching', 'virtual classroom', 'methods'],
            status: 'draft',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            readTime: 6
          },
          {
            _id: '4',
            title: 'Student Engagement in Remote Learning',
            slug: 'student-engagement-remote-learning',
            excerpt: 'Strategies to keep students motivated',
            content: 'Full content here...',
            author: {
              _id: 'author2',
              name: 'Maria Garcia',
              avatar: {
                url: 'https://i.pravatar.cc/150?img=5'
              }
            },
            featuredImage: {
              url: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc'
            },
            category: 'Education',
            tags: ['engagement', 'remote learning', 'motivation'],
            status: 'published',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            readTime: 8
          },
          {
            _id: '5',
            title: 'Assessment Strategies for Online Courses',
            slug: 'assessment-strategies-online-courses',
            excerpt: 'Effective ways to evaluate student learning online',
            content: 'Full content here...',
            author: {
              _id: 'author1',
              name: 'John Smith',
              avatar: {
                url: 'https://i.pravatar.cc/150?img=1'
              }
            },
            featuredImage: {
              url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173'
            },
            category: 'Assessment',
            tags: ['assessment', 'evaluation', 'online courses'],
            status: 'draft',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            readTime: 5
          }
        ];
        
        setBlogs(mockBlogs);
        setFilteredBlogs(mockBlogs);
        setTotalPages(Math.ceil(mockBlogs.length / blogsPerPage));
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    // Apply filtering
    let filtered = [...blogs];
    
    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(blog => 
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(blog => blog.status === statusFilter);
    }
    
    setFilteredBlogs(filtered);
    setTotalPages(Math.ceil(filtered.length / blogsPerPage));
    setCurrentPage(1); // Reset to first page when filter changes
  }, [searchQuery, statusFilter, blogs]);

  // Get blogs for current page
  const getCurrentPageBlogs = () => {
    const startIndex = (currentPage - 1) * blogsPerPage;
    const endIndex = startIndex + blogsPerPage;
    return filteredBlogs.slice(startIndex, endIndex);
  };

  // Helper to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper for status badge style
  const getStatusBadgeStyles = (status: string) => {
    return status === 'published' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Main content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Blog Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create, edit, and manage your blog posts
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link 
                href="/dashboard/admin/blogs/create" 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Create New Blog
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search blogs by title, author, or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="sm:w-48">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FunnelIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published')}
                    aria-label="Filter blogs by status"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Blog List */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {loading ? (
              <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading blogs...</p>
              </div>
            ) : getCurrentPageBlogs().length === 0 ? (
              <div className="py-20 text-center">
                <NewspaperIcon className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || statusFilter !== 'all' 
                    ? "Try adjusting your search or filter to find what you're looking for." 
                    : "Get started by creating a new blog post."}
                </p>
                <div className="mt-6">
                  <Link 
                    href="/dashboard/admin/blogs/create" 
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Create New Blog
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Blog
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Author
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Updated
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getCurrentPageBlogs().map((blog) => (
                        <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden">
                                {blog.featuredImage?.url ? (
                                  <Image 
                                    src={blog.featuredImage.url} 
                                    alt={blog.title}
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 bg-gray-200 flex items-center justify-center">
                                    <NewspaperIcon className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">{blog.excerpt}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden">
                                {blog.author.avatar?.url ? (
                                  <Image 
                                    src={blog.author.avatar.url} 
                                    alt={blog.author.name}
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <UserIcon className="h-4 w-4 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{blog.author.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyles(blog.status)}`}>
                              {blog.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(blog.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(blog.updatedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2 justify-end">
                              <Link href={`/blog/${blog.slug}`} className="text-gray-500 hover:text-gray-700">
                                <EyeIcon className="h-5 w-5" aria-label="View blog" />
                              </Link>
                              <Link href={`/dashboard/admin/blogs/edit/${blog._id}`} className="text-blue-600 hover:text-blue-900">
                                <PencilSquareIcon className="h-5 w-5" aria-label="Edit blog" />
                              </Link>
                              <button 
                                onClick={() => {
                                  // In a real application, this would open a confirmation modal
                                  // before deleting the blog
                                  alert(`This would delete: ${blog.title}`);
                                }}
                                className="text-red-600 hover:text-red-900"
                                aria-label={`Delete ${blog.title}`}
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

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * blogsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * blogsPerPage, filteredBlogs.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredBlogs.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        
                        {Array.from({length: totalPages}).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border ${
                              currentPage === i + 1
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            } text-sm font-medium`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 