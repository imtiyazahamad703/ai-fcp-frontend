import { type ReactNode } from 'react';

// ============================
// Auth Layout
// Professional, minimal, clean aesthetic
// ============================

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-zinc-50 dark:bg-zinc-950 transition-colors font-sans selection:bg-indigo-500/30">
      
      {/* Extremely subtle grid background for a tech feel */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.02]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[400px] flex flex-col items-center">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="mb-4 w-12 h-12 flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Welcome to AI-FCP
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Sign in to continue your session
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

