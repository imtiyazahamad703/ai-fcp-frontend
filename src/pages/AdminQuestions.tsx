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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 border-b border-[#1a1a26] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Manage Questions</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Review, edit, publish or delete AI-generated workspace questions.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin')} className="rounded-xl px-5 h-[42px] shrink-0">
          Generate New
        </Button>
      </div>

      {isLoading ? (
        <div className="h-64 flex justify-center items-center">
          <Loader text="Loading questions..." />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl font-medium">
          {error}
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-[#11111a]/60 border border-[#1e1e2d] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <p className="text-gray-400 mb-4 text-lg">No questions found in the database.</p>
          <Button variant="secondary" onClick={() => navigate('/admin')} className="rounded-xl px-5">
            Generate your first question
          </Button>
        </div>
      ) : (
        <div className="bg-[#11111a]/60 backdrop-blur-lg border border-[#1e1e2d] rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#161622]/60 border-b border-[#1e1e2d] text-xs font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-4 px-6">Title & Topic</th>
                  <th className="py-4 px-6">Workspace Type</th>
                  <th className="py-4 px-6">Difficulty</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e2d] text-sm">
                {questions.map((question) => (
                  <tr key={question._id} className="hover:bg-[#161622]/40 transition-colors group">
                    <td className="py-4 px-6 max-w-xs md:max-w-sm">
                      <div className="font-semibold text-white tracking-wide">{question.title}</div>
                      <div className="text-xs text-gray-500 mt-1 truncate" title={question.topic}>
                        {question.topic}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg font-extrabold uppercase tracking-wider border ${
                        question.type === 'react' 
                          ? 'bg-[#61dafb]/10 text-[#61dafb] border-[#61dafb]/20' 
                          : 'bg-[#8342ff]/10 text-[#a855f7] border-[#8342ff]/20'
                      }`}>
                        {question.type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase font-extrabold tracking-wider border ${
                        question.difficulty === 'easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        question.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {question.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase font-extrabold tracking-wider border ${
                        question.status === 'published' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.1)]' 
                          : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                        {question.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/admin/questions/${question._id}`)}
                          className="text-xs px-3.5 py-2 rounded-xl bg-[#8342ff]/10 text-[#00d4f5] hover:bg-[#8342ff] hover:text-white border border-[#8342ff]/20 transition-all font-semibold flex items-center gap-1.5 active:scale-95"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" /></svg>
                          Review
                        </button>
                        <button 
                          onClick={() => handleDelete(question._id!)}
                          className="text-xs px-3.5 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all font-semibold flex items-center gap-1.5 active:scale-95"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminQuestions;
