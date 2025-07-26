'use client';

import { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { apiGet, apiPut } from '../app/api/apiClient';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface INotification {
  _id: string;
  message: string;
  read: boolean;
  link: string;
  createdAt: string;
}

interface NotificationApiResponse {
  success: boolean;
  data: INotification[] | null;
  unreadCount?: number;
}

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      // Fetch notifications
      const res: NotificationApiResponse = await apiGet('/notifications', true);
      if (res.success) {
        if (Array.isArray(res.data)) {
          setNotifications(res.data);
        }
        if (typeof res.unreadCount === 'number') {
          setUnreadCount(res.unreadCount);
        }
      }
      // Fetch pending enrollment requests for educators
      try {
        const reqRes = await apiGet('/educator/requests', true);
        if (reqRes && Array.isArray(reqRes.data)) {
          setPendingRequests(reqRes.data.length);
        }
      } catch (e) {
        // ignore if user is not educator
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every 60 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: INotification) => {
    setIsOpen(false);
    if (!notification.read) {
      try {
        await apiPut(`/notifications/${notification._id}/read`, {}, true);
        setNotifications(
          notifications.map(n =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => prev - 1);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiPut('/notifications/readall', {}, true);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
      >
        <span className="sr-only">View notifications</span>
        <BellIcon className="h-6 w-6" aria-hidden="true" />
        {(unreadCount > 0 || pendingRequests > 0) && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-xs">
            {unreadCount + pendingRequests}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3 flex justify-between items-center border-b">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            {notifications.length > 0 && unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="text-sm text-indigo-600 hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          {/* Educator pending requests shortcut */}
          {pendingRequests > 0 && (
            <Link
              href="/dashboard/educator/requests"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-sm text-indigo-700 font-semibold hover:bg-indigo-50"
            >
              {pendingRequests} Enrollment Request{pendingRequests>1?'s':''} Pending
            </Link>
          )}
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <Link
                  key={notification._id}
                  href={notification.link || '#'}
                  onClick={() => handleNotificationClick(notification)}
                  className={`block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 ${
                    !notification.read ? 'bg-indigo-50' : ''
                  }`}
                >
                  <p className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No notifications yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 