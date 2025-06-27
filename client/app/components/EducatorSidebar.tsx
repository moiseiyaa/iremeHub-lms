"use client";

import React from 'react';
import Link from 'next/link';
import {
  ChartBarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  BellAlertIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SidebarItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  current?: boolean;
}

interface Props {
  activeTab: string;
  setActiveTab: (id: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const EducatorSidebar: React.FC<Props> = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const baseItems: SidebarItem[] = [
    { id: 'dashboard', name: 'Dashboard', href: '/dashboard/educator', icon: ChartBarIcon },
    { id: 'courses', name: 'Courses', href: '/dashboard/educator/courses', icon: AcademicCapIcon },
    { id: 'students', name: 'Students', href: '/dashboard/educator/students', icon: UserGroupIcon },
    { id: 'announcements', name: 'Announcements', href: '/dashboard/educator/announcements', icon: BellAlertIcon },
    { id: 'requests', name: 'Requests', href: '/dashboard/educator/requests', icon: BellAlertIcon },
    { id: 'profile', name: 'Profile', href: '/profile', icon: Cog6ToothIcon },
  ];

  const items = baseItems.map((item) => ({ ...item, current: activeTab === item.id }));

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden ${sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 z-40 w-64 transform bg-slate-800 text-slate-100 overflow-y-auto transition-transform duration-200 md:translate-x-0 md:static md:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between md:hidden px-4 h-16">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button aria-label="Close sidebar" onClick={() => setSidebarOpen(false)}>
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3 space-y-1">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md hover:bg-slate-700 hover:text-white transition-colors ${
                item.current ? 'bg-slate-900 text-white shadow' : 'text-slate-200'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default EducatorSidebar;
