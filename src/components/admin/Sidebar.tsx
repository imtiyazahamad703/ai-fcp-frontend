import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Moon, Sun } from 'lucide-react';

// ============================
// Admin Sidebar Component
// ============================

interface SidebarProps {
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

export const Sidebar = ({ theme = 'dark', toggleTheme }: SidebarProps) => {
  const { user, logout } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { name: 'Questions', path: '/admin/questions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Settings', path: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37-2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <aside className="w-64 bg-[var(--color-bg-elevated)] border-r border-[var(--color-border)] flex flex-col h-screen sticky top-0 transition-colors duration-200">
      <div className="p-6">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary-400)] to-[var(--color-accent-400)]">
          AI FCP Admin
        </h2>
        <p className="text-sm text-[var(--color-text-tertiary)] mt-1">Platform Management</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-colors ${
                isActive
                  ? 'bg-[var(--color-primary-500)]/10 text-[var(--color-primary-400)] font-medium'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
              }`
            }
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary-500)]/20 text-[var(--color-primary-400)] flex items-center justify-center font-bold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user?.name}</p>
            <p className="text-xs text-[var(--color-text-tertiary)] truncate">{user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between py-2 px-4 mb-2 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-hover)] transition-colors text-sm font-medium text-[var(--color-text-secondary)]"
        >
          <div className="flex items-center gap-2">
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-[var(--radius-md)] text-red-400 hover:bg-red-400/10 transition-colors text-sm font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
};
