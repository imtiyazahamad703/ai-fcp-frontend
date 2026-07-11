import { AdminLayout } from '../layouts/AdminLayout';

// ============================
// Admin Dashboard Page
// ============================

const AdminDashboard = () => {
  // Placeholder stats — will be connected to API in Sprint 3
  const stats = [
    { label: 'Total Questions', value: '0', icon: '📝', color: 'var(--color-primary-500)' },
    { label: 'Published', value: '0', icon: '✅', color: 'var(--color-success-500)' },
    { label: 'Draft', value: '0', icon: '📋', color: 'var(--color-warning-500)' },
    { label: 'Total Learners', value: '0', icon: '👥', color: 'var(--color-accent-500)' },
  ];

  return (
    <AdminLayout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome to the Admin Panel. Manage questions and monitor learner progress.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-stats stagger-children">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card glass">
              <div className="stat-icon" style={{ background: `${stat.color}20` }}>
                <span>{stat.icon}</span>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Placeholder */}
        <div className="dashboard-section">
          <h2>Recent Activity</h2>
          <div className="empty-state glass">
            <div className="empty-state-icon animate-float">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="empty-state-text">No activity yet</p>
            <p className="empty-state-hint">
              Start by generating AI questions or creating them manually.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
