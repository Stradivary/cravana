import React from 'react';
import { Bell, User } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  breadcrumb: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, breadcrumb }) => {
  return (
    <header className="flex items-center justify-between rounded-2xl bg-white px-6 py-4 shadow-md">
      <div>
        <p className="text-sm text-gray-500">{breadcrumb}</p>
        <h1 className="mt-1 text-xl font-bold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
          aria-label="Notifikasi"
        >
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-700">
          <User size={16} />
          <span>Profile</span>
        </div>
      </div>
    </header>
  );
};
