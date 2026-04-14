import React from 'react';
import { Home, LayoutGrid, Settings, Users } from 'lucide-react';
import { Button } from 'components/atoms/Button';

export type DashboardMenuKey = 'home' | 'dashboard' | 'users' | 'settings';

const menuItems: Array<{ key: DashboardMenuKey; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'settings', label: 'Settings', icon: Settings },
];

interface DashboardSidebarProps {
  activeMenu: DashboardMenuKey;
  onSelectMenu: (menu: DashboardMenuKey) => void;
  onLogout: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeMenu, onSelectMenu, onLogout }) => {
  return (
    <aside className="flex min-h-[calc(100vh-3rem)] w-full max-w-[260px] flex-col rounded-2xl bg-white p-5 shadow-md">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wide text-gray-500">Logo</p>
        <h2 className="mt-1 text-xl font-bold text-blue-600">RAMOUZ</h2>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.key;

            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => onSelectMenu(item.key)}
                  className={
                    `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ` +
                    (isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100')
                  }
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="pt-4">
        <Button variant="secondary" className="w-full" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </aside>
  );
};
