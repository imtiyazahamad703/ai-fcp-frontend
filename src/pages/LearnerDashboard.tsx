import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

// ============================
// Learner Dashboard Page
// ============================

const LearnerDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Placeholder stats
  const stats = [
    { label: 'Problems Solved', value: '0', total: '0', icon: '🎯' },
    { label: 'Accuracy', value: '0%', icon: '📊' },
    { label: 'Streak', value: '0 days', icon: '🔥' },
  ];

  return (
    <div className="learner-layout">
      {/* Header */}
      <header className="learner-header glass">
        <div className="learner-header-left">
          <span className="learner-brand gradient-text">AI-FCP</span>
        </div>
        <div className="learner-header-right">
          <span className="learner-greeting">
            Hello, <strong>{user?.name || 'Learner'}</strong>
          </span>
          <button className="workspace-logout-btn" onClick={handleLogout} title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="learner-main">
        {/* Stats */}
        <div className="learner-stats stagger-children">
          {stats.map((stat) => (
            <div key={stat.label} className="learner-stat-card glass">
              <span className="learner-stat-icon">{stat.icon}</span>
              <span className="learner-stat-value">{stat.value}</span>
              <span className="learner-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Questions Section */}
        <div className="learner-section">
          <div className="learner-section-header">
            <h2>Practice Questions</h2>
            <div className="learner-filters">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">React</button>
              <button className="filter-btn">NestJS</button>
              <button className="filter-btn">Full Stack</button>
            </div>
          </div>

          {/* Empty State */}
          <div className="empty-state glass">
            <div className="empty-state-icon animate-float">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <p className="empty-state-text">No questions available yet</p>
            <p className="empty-state-hint">
              Questions will appear here once the admin publishes them.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearnerDashboard;
