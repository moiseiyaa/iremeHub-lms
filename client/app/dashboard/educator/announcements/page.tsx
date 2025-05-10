'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  BellAlertIcon, 
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { apiGet, apiPost, apiDelete } from '../../../api/apiClient';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  courseId: string | null;
  courseName?: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

interface Course {
  _id: string;
  title: string;
}

// Mock data for development
const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    _id: '1',
    title: 'New Web Development Course Launch',
    content: 'We are excited to announce the launch of our new web development course. Join us to learn the latest technologies!',
    courseId: '1',
    courseName: 'Introduction to Web Development',
    createdAt: '2023-12-01T10:00:00.000Z',
    updatedAt: '2023-12-01T10:00:00.000Z',
    published: true
  },
  {
    _id: '2',
    title: 'Holiday Break Schedule',
    content: 'Please note that there will be no new lessons during the holiday break from December 24th to January 2nd.',
    courseId: null,
    createdAt: '2023-12-05T14:30:00.000Z',
    updatedAt: '2023-12-05T14:30:00.000Z',
    published: true
  },
  {
    _id: '3',
    title: 'JavaScript Workshop this Weekend',
    content: 'Join our special JavaScript workshop this Saturday at 10AM. We will cover advanced topics like closures, promises, and async/await.',
    courseId: '2',
    courseName: 'Advanced JavaScript Concepts',
    createdAt: '2023-12-10T09:15:00.000Z',
    updatedAt: '2023-12-10T09:15:00.000Z',
    published: true
  },
  {
    _id: '4',
    title: 'System Maintenance Notice',
    content: 'The platform will be down for maintenance on December 15th from 2AM to 4AM UTC.',
    courseId: null,
    createdAt: '2023-12-12T16:45:00.000Z',
    updatedAt: '2023-12-12T16:45:00.000Z',
    published: true
  },
  {
    _id: '5',
    title: '[Draft] Upcoming React Course Updates',
    content: 'We are planning to update our React course curriculum with the latest features. Stay tuned for more information.',
    courseId: '3',
    courseName: 'React Framework Deep Dive',
    createdAt: '2023-12-14T11:20:00.000Z',
    updatedAt: '2023-12-14T11:20:00.000Z',
    published: false
  }
];

const MOCK_COURSES: Course[] = [
  { _id: '1', title: 'Introduction to Web Development' },
  { _id: '2', title: 'Advanced JavaScript Concepts' },
  { _id: '3', title: 'React Framework Deep Dive' }
];

export default function AnnouncementsManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    courseId: '',
    published: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch announcements
        try {
          const response = await apiGet('/educator/announcements', true);
          if (response.success && Array.isArray(response.data)) {
            setAnnouncements(response.data);
          } else {
            setError('Failed to load announcements');
          }
        } catch (announcementErr) {
          console.error('Announcement fetch error:', announcementErr);
          setError('An error occurred while loading announcements');
          
          // Fallback dummy data for development
          setAnnouncements(MOCK_ANNOUNCEMENTS);
        }
        
        // Fetch courses for dropdown filters
        try {
          const response = await apiGet('/educator/courses', true);
          if (response.success && Array.isArray(response.data)) {
            setCourses(response.data);
          }
        } catch (courseErr) {
          console.error('Course fetch error:', courseErr);
          
          // Fallback dummy data for courses
          setCourses(MOCK_COURSES);
        }
      } catch (err) {
        console.error('Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const openCreateModal = () => {
    setCurrentAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      courseId: '',
      published: true
    });
    setShowModal(true);
  };
  
  const openEditModal = (announcement: Announcement) => {
    setCurrentAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      courseId: announcement.courseId || '',
      published: announcement.published
    });
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setCurrentAnnouncement(null);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      courseId: formData.courseId || null  // Convert empty string to null
    };
    
    try {
      if (currentAnnouncement) {
        // Update existing announcement
        const response = await apiPost(
          `/educator/announcements/${currentAnnouncement._id}`, 
          payload,
          true
        );
        
        if (response.success && response.data) {
          // Update the announcements list
          const updatedAnnouncement = response.data as Announcement;
          setAnnouncements(prevAnnouncements => 
            prevAnnouncements.map(a => 
              a._id === updatedAnnouncement._id ? updatedAnnouncement : a
            )
          );
          closeModal();
        }
      } else {
        // Create new announcement
        const response = await apiPost(
          '/educator/announcements', 
          payload,
          true
        );
        
        if (response.success && response.data) {
          // Add to the announcements list
          const newAnnouncement = response.data as Announcement;
          setAnnouncements(prevAnnouncements => [newAnnouncement, ...prevAnnouncements]);
          closeModal();
        }
      }
    } catch (err) {
      console.error('Error saving announcement:', err);
      setError('Failed to save announcement');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    
    try {
      const response = await apiDelete(`/educator/announcements/${id}`, true);
      
      if (response.success) {
        // Remove from the announcements list
        setAnnouncements(prevAnnouncements => 
          prevAnnouncements.filter(a => a._id !== id)
        );
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
      setError('Failed to delete announcement');
    } finally {
      setConfirmDelete(null);
    }
  };
  
  const togglePublish = async (announcement: Announcement) => {
    try {
      const response = await apiPost(
        `/educator/announcements/${announcement._id}/toggle-publish`,
        {},
        true
      );
      
      if (response.success && response.data) {
        // Update the announcements list
        const updatedAnnouncement = response.data as Announcement;
        setAnnouncements(prevAnnouncements => 
          prevAnnouncements.map(a => 
            a._id === updatedAnnouncement._id ? updatedAnnouncement : a
          )
        );
      }
    } catch (err) {
      console.error('Error toggling publish status:', err);
      setError('Failed to update announcement status');
    }
  };
  
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = 
      courseFilter === 'all' || 
      (courseFilter === 'general' && announcement.courseId === null) ||
      announcement.courseId === courseFilter;
    
    return matchesSearch && matchesCourse;
  });
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage announcements for your courses
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Announcement
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="relative flex-1 max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Filter announcements by course"
                  >
                    <option value="all">All Announcements</option>
                    <option value="general">General (No Course)</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading announcements...</p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <BellAlertIcon className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No announcements found</h3>
              <p className="mt-1 text-gray-500">
                {announcements.length === 0 
                  ? "You haven't created any announcements yet." 
                  : "No announcements match your current filters."}
              </p>
              {announcements.length === 0 && (
                <div className="mt-6">
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Your First Announcement
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {filteredAnnouncements.map((announcement) => (
                  <li key={announcement._id} className={`p-6 hover:bg-gray-50 ${!announcement.published ? 'bg-gray-50' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{announcement.title}</h3>
                          {!announcement.published && (
                            <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              Draft
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>
                            {announcement.courseId 
                              ? `Course: ${announcement.courseName || courses.find(c => c._id === announcement.courseId)?.title || 'Unknown Course'}`
                              : 'General Announcement'}
                          </span>
                          <span className="mx-2">•</span>
                          <span>Posted: {formatDate(announcement.createdAt)}</span>
                        </div>
                        
                        <div className="mt-3 text-sm text-gray-700">
                          <p className="whitespace-pre-line">{announcement.content}</p>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex-shrink-0 flex space-x-2">
                        <button
                          onClick={() => togglePublish(announcement)}
                          className={`p-2 ${announcement.published ? 'text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100' : 'text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100'} rounded-md inline-flex items-center`}
                          title={announcement.published ? 'Unpublish' : 'Publish'}
                        >
                          {announcement.published ? (
                            <XMarkIcon className="h-5 w-5" />
                          ) : (
                            <CheckIcon className="h-5 w-5" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => openEditModal(announcement)}
                          className="p-2 text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md inline-flex items-center"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(announcement._id)}
                          className={`p-2 ${confirmDelete === announcement._id ? 'bg-red-100' : 'bg-red-50 hover:bg-red-100'} text-red-600 hover:text-red-900 rounded-md inline-flex items-center`}
                          title={confirmDelete === announcement._id ? 'Click again to confirm delete' : 'Delete'}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {currentAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                    </h3>
                    
                    <div className="mt-4">
                      <form id="announcementForm" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                              Title
                            </label>
                            <input
                              type="text"
                              name="title"
                              id="title"
                              value={formData.title}
                              onChange={handleFormChange}
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Announcement title"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                              Content
                            </label>
                            <textarea
                              name="content"
                              id="content"
                              rows={5}
                              value={formData.content}
                              onChange={handleFormChange}
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Announcement content"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">
                              Course (optional)
                            </label>
                            <select
                              name="courseId"
                              id="courseId"
                              value={formData.courseId}
                              onChange={handleFormChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              aria-label="Select course for announcement"
                            >
                              <option value="">General Announcement (All Courses)</option>
                              {courses.map((course) => (
                                <option key={course._id} value={course._id}>{course.title}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name="published"
                              id="published"
                              checked={formData.published}
                              onChange={(e) => setFormData({...formData, published: e.target.checked})}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                              Publish immediately
                            </label>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  form="announcementForm"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {currentAnnouncement ? 'Save Changes' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 