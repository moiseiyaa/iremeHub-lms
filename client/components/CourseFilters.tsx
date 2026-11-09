'use client';

import { MagnifyingGlassIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

export type CatalogFilters = { category: string; level: string; price: string };

interface Props {
  query: string;
  filters: CatalogFilters;
  categories: string[];
  onSearch: (query: string) => void;
  onFilterChange: (filterType: keyof CatalogFilters, value: string) => void;
  onClearAll: () => void;
}

export default function CourseFilters({query, filters, categories, onSearch, onFilterChange, onClearAll}: Props) {
  return (
    <aside className="ih-card p-6 lg:sticky lg:top-24" aria-label="Course filters">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-lg tracking-tight inline-flex items-center gap-2"><AdjustmentsHorizontalIcon className="w-5 h-5 text-[#34805c]"/> Filters</h2>
        <button type="button" onClick={onClearAll} className="text-sm font-semibold text-[#397b5a] hover:underline">Reset</button>
      </div>
      <div className="mt-6">
        <label htmlFor="catalog-search" className="ih-form-label">Search</label>
        <div className="relative"><MagnifyingGlassIcon className="w-5 h-5 text-[#799185] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"/><input id="catalog-search" className="ih-input !pl-10" value={query} onChange={e=>onSearch(e.target.value)} placeholder="Search a course..." type="search" /></div>
      </div>
      <div className="mt-5"><label htmlFor="catalog-category" className="ih-form-label">Category</label><select id="catalog-category" className="ih-input" value={filters.category} onChange={e=>onFilterChange('category',e.target.value)}><option value="">All categories</option>{categories.map(category=><option key={category} value={category}>{category}</option>)}</select></div>
      <div className="mt-5"><label htmlFor="catalog-level" className="ih-form-label">Level</label><select id="catalog-level" className="ih-input" value={filters.level} onChange={e=>onFilterChange('level',e.target.value)}><option value="">All levels</option>{['Beginner','Intermediate','Advanced'].map(level=><option value={level} key={level}>{level}</option>)}</select></div>
      <div className="mt-5"><label htmlFor="catalog-price" className="ih-form-label">Access</label><select id="catalog-price" className="ih-input" value={filters.price} onChange={e=>onFilterChange('price',e.target.value)}><option value="">All courses</option><option value="free">Free</option><option value="paid">Paid</option></select></div>
      {(query || Object.values(filters).some(Boolean)) && <div className="mt-5 text-xs text-[#647d6b] flex gap-2 items-center"><XMarkIcon className="w-4 h-4"/> Filters applied</div>}
    </aside>
  );
}
