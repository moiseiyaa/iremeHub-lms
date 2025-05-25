'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UserIcon, EnvelopeIcon, PencilIcon, CheckIcon, XMarkIcon, CameraIcon, HomeIcon } from '@heroicons/react/24/outline';

// Default image for users without an avatar
const DEFAULT_AVATAR = 'https://placehold.co/160x160/e2e8f0/1e293b/png?text=User';

// Utility function to ensure we never have empty image URLs
const getSafeImageUrl = (avatar: { public_id?: string; url: string; } | string | null | undefined, fallback: string): string => {
  if (!avatar) {
    return fallback;
  }
  
  // If avatar is a string (for backward compatibility)
  if (typeof avatar === 'string') {
    return avatar.trim() === '' ? fallback : avatar;
  }
  
  // If avatar is an object with url property
  if (typeof avatar === 'object' && avatar.url) {
    return avatar.url.trim() === '' ? fallback : avatar.url;
  }
  
  return fallback;
};

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: {
    public_id?: string;
    url: string;
  } | string;
  bio: string;
}

export default function Profile() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    const fetchUserProfile = async () => {
      try {
        console.log('Fetching user profile...');
        const res = await fetch('/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await res.json();
        console.log('Profile data received:', data);
        
        if (!data || !data.data) {
          console.error('Invalid response format:', data);
          throw new Error('Invalid response format from server');
        }
        
        const userData = {
          id: data.data.id || data.data._id || '',
          name: data.data.name || 'User',
          email: data.data.email || '',
          role: data.data.role || 'student',
          avatar: data.data.avatar || null,
          bio: data.data.bio || ''
        };
        
        setUser(userData);
        setFormData({
          name: userData.name,
          email: userData.email,
          bio: userData.bio,
        });
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      const res = await fetch('/api/v1/auth/updatedetails', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      
      setUser(data.data);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      setError(errorMessage);
    }
  };

  const cancelEdit = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
      });
    }
    setIsEditing(false);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset messages
    setError('');
    setSuccess('');
    setUploadingImage(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Create form data
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch('/api/v1/auth/updateavatar', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile picture');
      }

      console.log('Avatar update response:', data);
      console.log('User avatar data:', data.data.avatar);
      
      setUser(data.data);
      setSuccess('Profile picture updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile picture';
      setError(errorMessage);
      console.error('Avatar update error:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0091ff] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[calc(100vh-64px)] py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#0091ff]/90 to-blue-700/80 px-6 py-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex flex-col sm:flex-row items-center mb-4 sm:mb-0">
                <div 
                  className="h-20 w-20 rounded-full bg-white flex items-center justify-center mb-4 sm:mb-0 sm:mr-6 relative group cursor-pointer"
                  onClick={handleImageClick}
                >
                  {uploadingImage ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <>
                      {user?.avatar ? (
                        <>
                          <div className="relative w-full h-full rounded-full overflow-hidden">
                            <Image
                              src={getSafeImageUrl(user.avatar, DEFAULT_AVATAR)}
                              alt={user?.name || 'User'}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <CameraIcon className="h-6 w-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <UserIcon className="h-10 w-10 text-[#0091ff]" />
                      )}
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    title="Upload profile picture"
                    aria-label="Upload profile picture"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                  <p className="text-blue-100">
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-white text-[#0091ff] rounded-md hover:bg-gray-100"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                )}
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center px-4 py-2 bg-white text-[#0091ff] rounded-md hover:bg-gray-100"
                >
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Dashboard
                </button>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-8 sm:p-10">
            {error && (
              <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}
            
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0091ff] focus:border-[#0091ff]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0091ff] focus:border-[#0091ff]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      id="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0091ff] focus:border-[#0091ff]"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0091ff] hover:bg-blue-600"
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Contact Information</h3>
                  <div className="text-gray-500 flex items-center">
                    <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-400" />
                    {user?.email}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Bio</h3>
                  <p className="text-gray-500">
                    {user?.bio || 'No bio provided yet.'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Account Settings</h3>
                  <div className="mt-3 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <a
                      href="/change-password"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Change Password
                    </a>
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