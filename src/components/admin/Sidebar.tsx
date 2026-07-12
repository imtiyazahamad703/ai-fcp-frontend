import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useState } from 'react';

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
    { name: 'Team', path: '/admin/users', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
  ];

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] px-4 h-14 w-full">
        <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary-400)] to-[var(--color-accent-400)]">
          AI FCP Admin
        </h2>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Main Container */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-50 md:z-auto h-[100dvh] md:h-screen w-64 bg-[var(--color-bg-elevated)] border-r border-[var(--color-border)] flex flex-col transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
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
            onClick={() => setIsMobileOpen(false)}
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

      <div className="p-4 border-t border-[var(--color-border)] shrink-0">
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
    </>
  );
};
