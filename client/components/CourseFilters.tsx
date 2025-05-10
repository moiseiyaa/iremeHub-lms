'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface CourseFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filterType: string, value: string) => void;
  onClearAll: () => void;
}

export default function CourseFilters({ onSearch, onFilterChange, onClearAll }: CourseFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden p-4 border-b border-gray-100">
        <button
          onClick={toggleFilters}
          className="w-full flex items-center justify-between text-gray-700 hover:text-gray-900"
        >
          <span className="flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </span>
          <XMarkIcon className={`h-5 w-5 transform transition-transform ${isFilterOpen ? 'rotate-0' : 'rotate-180'}`} />
        </button>
      </div>

      <div className={`${isFilterOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <button
              onClick={onClearAll}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear all
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              onChange={(e) => onFilterChange('category', e.target.value)}
              className="block w-full py-2.5 pl-3 pr-10 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Select course category"
            >
              <option value="">All Categories</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="marketing">Marketing</option>
              <option value="it-software">IT & Software</option>
            </select>
          </div>

          {/* Level */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Level
            </label>
            <select
              onChange={(e) => onFilterChange('level', e.target.value)}
              className="block w-full py-2.5 pl-3 pr-10 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Select course level"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <select
              onChange={(e) => onFilterChange('price', e.target.value)}
              className="block w-full py-2.5 pl-3 pr-10 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Select price range"
            >
              <option value="">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="under-50">Under $50</option>
              <option value="50-100">$50 - $100</option>
              <option value="over-100">Over $100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
} 