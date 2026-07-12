import { AdminLayout } from '../layouts/AdminLayout';
import { QuestionGenerator } from '../features/admin/QuestionGenerator';

// ============================
// Admin Dashboard Page
// ============================

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="dashboard-page mb-8 border-b border-[#1a1a26] pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-2 text-sm">
          Generate questions with AI and manage practice assignments for learners.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Top Section: AI Generator */}
        <section>
          <QuestionGenerator />
        </section>

        {/* Future Section: Analytics Placeholder */}
        <section>
          <div className="bg-[#11111a]/60 backdrop-blur-lg border border-[#1e1e2d] rounded-2xl p-8 shadow-md flex flex-col items-center justify-center text-center h-52 group hover:border-[#8342ff]/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#8342ff]/10 text-[#00d4f5] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-[#8342ff]/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <h4 className="font-extrabold text-white mb-1.5">Detailed Analytics & Insights</h4>
            <p className="text-xs text-gray-500 max-w-md leading-relaxed">
              Track student progress, submission time distributions, test pass rates, and custom cohorts. Coming in the next platform release.
            </p>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
