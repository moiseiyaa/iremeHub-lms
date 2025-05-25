'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  PhotoIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface FormData {
  title: string;
  shortDescription: string;
  description: string;
  price: string;
  category: string;
  level: string;
  thumbnail: File | null;
  prerequisites: string[];
  outcomes: string[];
  status: string;
}

const categories = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'AI',
  'Business',
  'Marketing',
  'IT & Software',
  'Personal Development',
  'Design',
  'Photography',
  'Music',
  'Other'
];

const levels = [
  'Beginner',
  'Intermediate',
  'Advanced'
];

export default function CreateCourse() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    shortDescription: '',
    description: '',
    price: '',
    category: '',
    level: '',
    thumbnail: null,
    prerequisites: [''],
    outcomes: [''],
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, thumbnail: file });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear error
      if (errors.thumbnail) {
        setErrors({ ...errors, thumbnail: '' });
      }
    }
  };

  const clearThumbnail = () => {
    setFormData({ ...formData, thumbnail: null });
    setThumbnailPreview(null);
  };

  const handleArrayItemChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    index: number, 
    field: 'prerequisites' | 'outcomes'
  ) => {
    const newArray = [...formData[field]];
    newArray[index] = e.target.value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: 'prerequisites' | 'outcomes') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const removeArrayItem = (index: number, field: 'prerequisites' | 'outcomes') => {
    if (formData[field].length > 1) {
      const newArray = [...formData[field]];
      newArray.splice(index, 1);
      setFormData({ ...formData, [field]: newArray });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.level) newErrors.level = 'Level is required';
    
    // Price validation
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum < 0) {
        newErrors.price = 'Price must be a valid positive number';
      }
    }
    
    // Validate prerequisites and outcomes
    if (formData.prerequisites.some(prereq => !prereq.trim())) {
      newErrors.prerequisites = 'All prerequisites must be filled or removed';
    }
    
    if (formData.outcomes.some(outcome => !outcome.trim())) {
      newErrors.outcomes = 'All learning outcomes must be filled or removed';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare form data for API
      const courseData = new FormData();
      courseData.append('title', formData.title);
      courseData.append('shortDescription', formData.shortDescription);
      courseData.append('description', formData.description);
      courseData.append('price', formData.price);
      courseData.append('category', formData.category);
      courseData.append('level', formData.level);
      courseData.append('status', formData.status);
      
      // Add thumbnail if exists
      if (formData.thumbnail) {
        courseData.append('thumbnail', formData.thumbnail);
      }
      
      // Add arrays
      formData.prerequisites.forEach((prereq, index) => {
        if (prereq.trim()) {
          courseData.append(`prerequisites[${index}]`, prereq);
        }
      });
      
      formData.outcomes.forEach((outcome, index) => {
        if (outcome.trim()) {
          courseData.append(`outcomes[${index}]`, outcome);
        }
      });
      
      // This endpoint will need to be implemented in your backend
      const response = await fetch('/api/v1/educator/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: courseData,
      });
      
      // Check for non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If we got HTML instead of JSON, extract an error message
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 150));
        throw new Error('Server returned invalid response format. Is the API server running?');
      }
      
      if (response.ok) {
        setSubmitSuccess(true);
        
        // Redirect to course edit page after 2 seconds
        setTimeout(() => {
          router.push(`/dashboard/educator/courses/${data.data._id}/edit`);
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to create course');
      }
    } catch (err) {
      console.error('Error creating course:', err);
      setErrors({
        ...errors,
        form: err instanceof Error ? err.message : 'An error occurred while creating the course'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link 
              href="/dashboard/educator/courses" 
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="mr-1 h-4 w-4" />
              Back to Courses
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Create New Course</h1>
          </div>
        </div>
        
        {/* Success message */}
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
            <CheckIcon className="h-5 w-5 mr-2" />
            <span>Course created successfully! Redirecting...</span>
          </div>
        )}
        
        {/* Form error message */}
        {errors.form && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.form}
          </div>
        )}
        
        {/* Course creation form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
            <p className="mt-1 text-sm text-gray-500">
              Start with the basic details of your course
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="e.g. Advanced JavaScript for Web Developers"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>
            
            {/* Short Description */}
            <div>
              <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
                Short Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="shortDescription"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${errors.shortDescription ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="A brief description that appears in course cards"
                maxLength={200}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.shortDescription.length}/200 characters
              </p>
              {errors.shortDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>
              )}
            </div>
            
            {/* Full Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Full Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Provide a detailed description of your course"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
            
            {/* Category and Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.category ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  aria-label="Course category"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                  Level <span className="text-red-500">*</span>
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.level ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  aria-label="Course difficulty level"
                >
                  <option value="">Select a level</option>
                  {levels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                {errors.level && (
                  <p className="mt-1 text-sm text-red-600">{errors.level}</p>
                )}
              </div>
            </div>
            
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price (USD) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={`block w-full pl-7 pr-12 py-2 border ${errors.price ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="0.00"
                  aria-describedby="price-currency"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm" id="price-currency">
                    USD
                  </span>
                </div>
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Set to 0 for a free course
              </p>
            </div>
            
            {/* Course Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Course Thumbnail
              </label>
              <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className={`flex justify-center items-center px-6 pt-5 pb-6 border-2 ${errors.thumbnail ? 'border-red-300' : 'border-gray-300'} border-dashed rounded-md w-full sm:w-1/3`}>
                  <div className="space-y-1 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="thumbnail" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a file</span>
                        <input 
                          id="thumbnail" 
                          name="thumbnail"
                          type="file" 
                          accept="image/*"
                          className="sr-only" 
                          onChange={handleThumbnailChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
                
                {thumbnailPreview && (
                  <div className="relative w-full sm:w-1/3">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="rounded-md object-cover h-32 w-full" 
                    />
                    <button
                      type="button"
                      onClick={clearThumbnail}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-200"
                      aria-label="Remove thumbnail"
                    >
                      <XMarkIcon className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
              {errors.thumbnail && (
                <p className="mt-1 text-sm text-red-600">{errors.thumbnail}</p>
              )}
            </div>
          </div>
          
          {/* Prerequisites */}
          <div className="p-6 border-t border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Prerequisites</h2>
            <p className="mt-1 text-sm text-gray-500">
              List any prerequisites that learners should know before taking this course
            </p>
            
            <div className="mt-4 space-y-3">
              {formData.prerequisites.map((prereq, index) => (
                <div key={`prereq-${index}`} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={prereq}
                    onChange={(e) => handleArrayItemChange(e, index, 'prerequisites')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={`Prerequisite ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, 'prerequisites')}
                    className="p-2 text-gray-400 hover:text-gray-500"
                    aria-label="Remove prerequisite"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('prerequisites')}
                className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Prerequisite
              </button>
              
              {errors.prerequisites && (
                <p className="mt-1 text-sm text-red-600">{errors.prerequisites}</p>
              )}
            </div>
          </div>
          
          {/* Learning Outcomes */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Learning Outcomes</h2>
            <p className="mt-1 text-sm text-gray-500">
              What will learners be able to do after completing this course?
            </p>
            
            <div className="mt-4 space-y-3">
              {formData.outcomes.map((outcome, index) => (
                <div key={`outcome-${index}`} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={outcome}
                    onChange={(e) => handleArrayItemChange(e, index, 'outcomes')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={`Learning outcome ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, 'outcomes')}
                    className="p-2 text-gray-400 hover:text-gray-500"
                    aria-label="Remove learning outcome"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('outcomes')}
                className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Learning Outcome
              </button>
              
              {errors.outcomes && (
                <p className="mt-1 text-sm text-red-600">{errors.outcomes}</p>
              )}
            </div>
          </div>
          
          {/* Course Status */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Course Status</h2>
            <p className="mt-1 text-sm text-gray-500">
              Select the initial status for your course
            </p>
            
            <div className="mt-4">
              <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                <div className="flex items-center">
                  <input
                    id="status-draft"
                    name="status"
                    type="radio"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={handleChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label htmlFor="status-draft" className="ml-3 block text-sm font-medium text-gray-700">
                    Draft (hidden from students)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="status-published"
                    name="status"
                    type="radio"
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={handleChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label htmlFor="status-published" className="ml-3 block text-sm font-medium text-gray-700">
                    Published (visible to students)
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div className="p-6 flex justify-end space-x-3">
            <Link
              href="/dashboard/educator/courses"
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || submitSuccess}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(loading || submitSuccess) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Creating...' : submitSuccess ? 'Created!' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 