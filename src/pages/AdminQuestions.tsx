import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AdminLayout } from '../layouts/AdminLayout';
import { adminService } from '../services/admin.service';
import { useAdminStore } from '../store/useAdminStore';
import { Loader } from '../components/common/Loader';
import { Button } from '../components/common/Button';

// ============================
// Admin Questions List Page
// ============================

const AdminQuestions = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { questions, setQuestions } = useAdminStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getQuestions();
      setQuestions(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch questions');
      setError(err.message || 'Failed to fetch questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await adminService.deleteQuestion(id);
      setQuestions(questions.filter(q => q._id !== id));
      toast.success('Question deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete question');
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Manage Questions</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">
            Review, edit, and publish generated questions
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin')}>
          Generate New
        </Button>
      </div>

      {isLoading ? (
        <div className="h-64 flex justify-center items-center">
          <Loader text="Loading questions..." />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-[var(--radius-md)]">
          {error}
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-12 flex flex-col items-center justify-center text-center">
          <p className="text-[var(--color-text-secondary)] mb-4">No questions found.</p>
          <Button variant="secondary" onClick={() => navigate('/admin')}>
            Generate your first question
          </Button>
        </div>
      ) : (
        <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-bg-hover)] border-b border-[var(--color-border)]">
                <th className="py-3 px-4 text-xs uppercase font-semibold text-[var(--color-text-secondary)]">Title</th>
                <th className="py-3 px-4 text-xs uppercase font-semibold text-[var(--color-text-secondary)]">Type</th>
                <th className="py-3 px-4 text-xs uppercase font-semibold text-[var(--color-text-secondary)]">Difficulty</th>
                <th className="py-3 px-4 text-xs uppercase font-semibold text-[var(--color-text-secondary)]">Status</th>
                <th className="py-3 px-4 text-xs uppercase font-semibold text-[var(--color-text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {questions.map((question) => (
                <tr key={question._id} className="hover:bg-[var(--color-bg-hover)] transition-colors group">
                  <td className="py-4 px-4">
                    <div className="font-medium text-[var(--color-text-primary)]">{question.title}</div>
                    <div className="text-xs text-[var(--color-text-tertiary)] truncate w-64">{question.userPrompt}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-[var(--color-text-secondary)] capitalize">{question.type}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider ${
                      question.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                      question.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {question.difficulty}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider ${
                      question.status === 'published' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {question.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-2 transition-opacity">
                      <button 
                        onClick={() => navigate(`/admin/questions/${question._id}`)}
                        className="text-sm px-3 py-1.5 rounded bg-[var(--color-primary-500)]/10 text-[var(--color-primary-400)] hover:bg-[var(--color-primary-500)]/20 transition-colors"
                      >
                        Review
                      </button>
                      <button 
                        onClick={() => handleDelete(question._id!)}
                        className="text-sm px-3 py-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminQuestions;
