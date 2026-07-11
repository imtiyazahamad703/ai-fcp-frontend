import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { learnerService } from '../services/learner.service';
import type { IQuestion } from '../types';
import { Loader } from '../components/common/Loader';

const LearnerDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await learnerService.getPublishedQuestions();
        setQuestions(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch questions');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      <nav className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary-400)] to-[var(--color-primary-600)]">
          AI FCP Learner
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Hello, {user?.name}</span>
          <button 
            onClick={logout} 
            className="text-sm text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-hover)] px-3 py-1.5 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-white mb-3">Available Practices</h2>
          <p className="text-[var(--color-text-secondary)] text-lg">Pick a real-world task and start coding.</p>
        </div>

        {isLoading ? (
          <div className="h-64 flex justify-center items-center">
            <Loader text="Loading practices..." />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-[var(--radius-md)]">
            {error}
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-12 text-center">
            <p className="text-[var(--color-text-secondary)] text-lg">No practices are currently available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map(q => (
              <div 
                key={q._id} 
                className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-sm hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)] hover:border-[var(--color-primary-500)]/30 transition-all group flex flex-col h-full cursor-pointer"
                onClick={() => navigate(`/workspace/${q._id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${
                    q.type === 'react' ? 'bg-[#61dafb]/10 text-[#61dafb]' :
                    q.type === 'nestjs' ? 'bg-[#ea2845]/10 text-[#ea2845]' :
                    'bg-[var(--color-primary-500)]/10 text-[var(--color-primary-400)]'
                  }`}>
                    {q.type}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider ${
                    q.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                    q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--color-primary-400)] transition-colors line-clamp-2">
                  {q.title}
                </h3>
                
                <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3 mb-6 flex-grow">
                  {q.topic}
                </p>
                
                <button 
                  className="w-full py-2.5 bg-[var(--color-bg-hover)] group-hover:bg-[var(--color-primary-500)] text-[var(--color-text-primary)] group-hover:text-white rounded-[var(--radius-md)] text-sm font-medium transition-all"
                >
                  Start Solving
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LearnerDashboard;
