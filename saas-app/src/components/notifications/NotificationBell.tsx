"use client";

import { useState } from "react";
import { markNotificationAsRead } from "@/app/dashboard/settings/notifications/actions";

export default function NotificationBell({ initialNotifications }: { initialNotifications: any[] }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await markNotificationAsRead(id);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none relative"
      >
        <span className="sr-only">View notifications</span>
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 focus:outline-none">
          <div className="py-2 px-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`p-4 border-b border-gray-50 flex flex-col ${n.is_read ? 'opacity-60' : 'bg-blue-50'}`}>
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    {!n.is_read && (
                      <button onClick={() => handleMarkAsRead(n.id)} className="text-xs text-blue-600 hover:text-blue-800">
                        Mark read
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
          <div className="py-2 px-4 border-t border-gray-100 text-center">
            <a href="/dashboard/settings/notifications" className="text-sm text-gray-600 hover:text-gray-900">
              Notification Settings
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
