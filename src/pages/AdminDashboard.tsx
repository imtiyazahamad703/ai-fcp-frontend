import { AdminLayout } from '../layouts/AdminLayout';
import { QuestionGenerator } from '../features/admin/QuestionGenerator';

// ============================
// Admin Dashboard Page
// ============================

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="dashboard-page mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Admin Dashboard</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">
          Manage platform questions and AI generation
        </p>
      </div>

      <div className="grid gap-8">
        {/* Top Section: AI Generator */}
        <section>
          <QuestionGenerator />
        </section>

        {/* Future Section: Question List (Sprint 4) */}
        <section>
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-sm flex items-center justify-center h-48">
            <p className="text-[var(--color-text-tertiary)]">Question List & Review UI coming in next sprint.</p>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
