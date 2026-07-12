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
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qData, profile] = await Promise.all([
          learnerService.getPublishedQuestions(),
          learnerService.getProfile()
        ]);
        setQuestions(qData);
        setCompletedIds(profile.completedQuestions);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#08080c] text-[var(--color-text-primary)] font-sans">
      <nav className="border-b border-[#1a1a26] bg-[#0a0a10]/80 backdrop-blur-md p-4 flex justify-between items-center shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#8342ff] to-[#00d4f5]">
          AI FCP Learner
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#8342ff]/10 text-[#00d4f5] flex items-center justify-center font-bold text-xs">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-gray-300">Hello, {user?.name}</span>
          </div>
          <button 
            onClick={logout} 
            className="text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500/10 border border-transparent hover:border-red-500/20 px-3 py-1.5 rounded-xl transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2">Available Practices</h2>
            <p className="text-gray-400 text-lg">Pick a real-world task and start coding.</p>
          </div>
          {!isLoading && (
            <div className="bg-[#11111a]/60 backdrop-blur-md border border-[#1e1e2d] px-6 py-4 rounded-2xl flex items-center gap-4 shadow-lg shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Progress</p>
                <p className="text-2xl font-black text-white">
                  {completedIds.length} <span className="text-gray-500 text-lg font-normal">/ {questions.length}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="h-64 flex justify-center items-center">
            <Loader text="Loading practices..." />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
            {error}
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-[#11111a]/60 border border-[#1e1e2d] rounded-2xl p-12 text-center">
            <p className="text-gray-400 text-lg">No practices are currently available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map(q => (
              <div 
                key={q._id} 
                className="bg-[#11111a]/60 backdrop-blur-md border border-[#1e1e2d] rounded-2xl p-6 shadow-md hover:shadow-[0_0_30px_rgba(108,34,255,0.15)] hover:border-[#8342ff]/50 transition-all duration-300 hover:-translate-y-1.5 group flex flex-col h-full cursor-pointer"
                onClick={() => navigate(`/workspace/${q._id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] px-2.5 py-1 rounded-lg font-extrabold uppercase tracking-wider border ${
                    q.type === 'react' 
                      ? 'bg-[#61dafb]/10 text-[#61dafb] border-[#61dafb]/20' 
                      : 'bg-[#8342ff]/10 text-[#a855f7] border-[#8342ff]/20'
                  }`}>
                    {q.type}
                  </span>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase font-extrabold tracking-wider border ${
                    q.difficulty === 'easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>
                
                <h3 className="text-xl font-extrabold mb-2 group-hover:text-[#00d4f5] transition-colors duration-300 line-clamp-2 flex items-center gap-2 text-white">
                  {q.title}
                  {completedIds.includes(q._id as string) && (
                    <span title="Completed" className="text-green-400 shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </span>
                  )}
                </h3>
                
                <p className="text-sm text-gray-400 line-clamp-3 mb-6 flex-grow">
                  {q.topic}
                </p>
                
                <button 
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    completedIds.includes(q._id as string) 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20 group-hover:bg-green-500/20'
                      : 'bg-[#1a1a26] text-gray-300 border border-[#2d2d3d] group-hover:bg-gradient-to-r group-hover:from-[#8342ff] group-hover:to-[#00d4f5] group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_0_15px_rgba(108,34,255,0.3)]'
                  }`}
                >
                  {completedIds.includes(q._id as string) ? 'Solve Again' : 'Start Solving'}
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
