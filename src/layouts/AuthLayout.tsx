import { type ReactNode } from 'react';

// ============================
// Auth Layout
// Centered card with animated background
// ============================

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="auth-layout">
      {/* Background effects */}
      <div className="auth-bg">
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
        <div className="auth-bg-orb auth-bg-orb-3" />
      </div>

      {/* Content */}
      <div className="auth-container animate-fade-in-up">
        {/* Logo / Brand */}
        <div className="auth-brand">
          <div className="auth-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="url(#logo-gradient)" />
              <path
                d="M12 28V12h4l4 8 4-8h4v16h-4V18l-4 8-4-8v10h-4z"
                fill="white"
                fillOpacity="0.95"
              />
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#6c22ff" />
                  <stop offset="1" stopColor="#00d4f5" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="auth-title">
            <span className="gradient-text">AI-FCP</span>
          </h1>
          <p className="auth-subtitle">Full Stack Coding Practice</p>
        </div>

        {/* Card */}
        <div className="auth-card glass">
          {children}
        </div>
      </div>
    </div>
  );
};
