'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, CheckIcon, PhotoIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { apiPost } from '../../../../api/apiClient'; // Adjust path as needed

interface BlogFormData {
  title: string;
  content: string;
  category: string;
  tags: string; // Comma-separated string for simplicity
  status: 'draft' | 'published';
  featuredImage?: File | null;
}

export default function NewBlogPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    category: '',
    tags: '',
    status: 'draft',
    featuredImage: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, featuredImage: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData(prev => ({ ...prev, featuredImage: null }));
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const blogPostPayload = new FormData();
    blogPostPayload.append('title', formData.title);
    blogPostPayload.append('content', formData.content);
    blogPostPayload.append('category', formData.category);
    blogPostPayload.append('tags', formData.tags);
    blogPostPayload.append('status', formData.status);
    if (formData.featuredImage) {
      blogPostPayload.append('featuredImage', formData.featuredImage);
    }

    try {
      // When sending FormData, apiPost (and underlying fetch) should automatically set 
      // Content-Type to multipart/form-data. We might need to adjust apiPost or apiRequest 
      // in apiClient.js if it strictly enforces application/json.
      // For now, assuming apiPost is flexible or we'll adjust it later.
      const response = await apiPost('/blogs', blogPostPayload, true);

      if (response.success) {
        setSuccessMessage('Blog post created successfully! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard/admin/blogs');
        }, 2000);
      } else {
        setError(response.error || 'Failed to create blog post.');
      }
    } catch (err: unknown) {
      console.error('Blog creation error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 p-4 sm:p-6 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header */} 
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">Create New Blog Post</h1>
          <Link href="/dashboard/admin/blogs" className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Blogs
          </Link>
        </div>

        {/* Form */} 
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-6">
          {error && <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">{error}</div>}
          {successMessage && <div className="p-3 bg-green-100 text-green-700 border border-green-300 rounded-md">{successMessage}</div>}

          {/* Title */} 
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input 
              type="text" 
              name="title" 
              id="title" 
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Content (Textarea for now) */} 
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">Content</label>
            <textarea 
              name="content" 
              id="content" 
              rows={10}
              value={formData.content}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Write your blog post content here..."
            ></textarea>
          </div>

          {/* Category */} 
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <input 
              type="text" 
              name="category" 
              id="category" 
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., Technology, Lifestyle"
            />
          </div>

          {/* Tags */} 
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
            <input 
              type="text" 
              name="tags" 
              id="tags" 
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., react, javascript, webdev"
            />
          </div>

          {/* Status */} 
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select 
              name="status" 
              id="status" 
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Featured Image Upload */} 
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Featured Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Featured image preview" className="mx-auto h-48 w-auto object-contain rounded-md" />
                ) : (
                  <PhotoIcon className="mx-auto h-12 w-12 text-slate-400" />
                )}
                <div className="flex text-sm text-slate-600">
                  <label 
                    htmlFor="featuredImage"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input id="featuredImage" name="featuredImage" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
            {formData.featuredImage && (
              <button 
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, featuredImage: null }));
                  setImagePreview(null);
                  // Also reset the file input value if possible, or provide a key to re-render it
                  const fileInput = document.getElementById('featuredImage') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
                className="mt-2 text-xs text-red-600 hover:text-red-800"
              >
                Remove image
              </button>
            )}
          </div>

          {/* Submit Button */} 
          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Create Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 