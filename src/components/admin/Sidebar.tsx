import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

// ============================
// Admin Sidebar Component
// ============================

export const Sidebar = () => {
  const { user, logout } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { name: 'Questions', path: '/admin/questions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Settings', path: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <aside className="w-64 bg-[#0a0a10]/85 backdrop-blur-lg border-r border-[#1e1e2d] flex flex-col h-screen sticky top-0 z-20">
      <div className="p-6 border-b border-[#1a1a26] mb-4">
        <h2 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#8342ff] to-[#00d4f5]">
          AI FCP Admin
        </h2>
        <p className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-widest mt-1">Platform Control</p>
      </div>

      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                isActive
                  ? 'bg-gradient-to-r from-[#8342ff]/10 to-transparent text-white font-semibold'
                  : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[#1a1a26]/40'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 w-1.5 h-6 bg-gradient-to-b from-[#8342ff] to-[#00d4f5] rounded-r-full shadow-[0_0_12px_#8342ff]" />
                )}
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={`transition-colors duration-200 ${isActive ? 'text-[#00d4f5]' : 'text-gray-500 group-hover:text-gray-300'}`}
                >
                  <path d={item.icon} />
                </svg>
                <span className="text-sm tracking-wide">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1a1a26] bg-[#0c0c16]/30">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8342ff] to-[#00d4f5] text-white flex items-center justify-center font-bold shadow-md shadow-[#8342ff]/20">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{user?.name}</p>
            <p className="text-xs text-[var(--color-text-tertiary)] truncate">{user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-red-400 hover:text-white hover:bg-red-500/10 active:scale-[0.98] transition-all text-sm font-medium border border-transparent hover:border-red-500/20"
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
