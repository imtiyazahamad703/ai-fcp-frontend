import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from '../components/admin/Sidebar';

// ============================
// Admin Layout
// ============================

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('admin-theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('admin-theme', themeMode);
    const root = window.document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  const toggleTheme = () => setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar theme={themeMode} toggleTheme={toggleTheme} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
