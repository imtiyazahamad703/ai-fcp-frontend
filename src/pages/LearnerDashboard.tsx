import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { learnerService } from '../services/learner.service';
import type { IQuestion } from '../types';
import { Sidebar } from '../components/Sidebar';
import { ChallengeList } from '../components/ChallengeList';
import { ProgressDashboard } from '../components/ProgressDashboard';
import { NotesView } from '../components/NotesView';

const LearnerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'challenges' | 'dashboard' | 'notes'>('challenges');
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('learner-theme') as 'light' | 'dark') || 'dark';
  });

  // Sync theme with HTML class attribute and localStorage
  useEffect(() => {
    localStorage.setItem('learner-theme', themeMode);
    const root = window.document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qData, profile, subs] = await Promise.all([
          learnerService.getPublishedQuestions(),
          learnerService.getProfile(),
          learnerService.getSubmissions()
        ]);
        setQuestions(qData);
        setCompletedIds(profile.completedQuestions || []);
        setSubmissions(subs || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col md:flex-row font-sans transition-colors duration-200">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={themeMode}
        toggleTheme={toggleTheme}
      />
      <main className="flex-1 h-screen overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
            <p className="text-xs font-semibold text-zinc-400 font-mono tracking-wider animate-pulse">
              LOADING SYSTEM MODULES...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 max-w-lg mx-auto">
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
              {error}
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'challenges' && (
              <ChallengeList
                challenges={questions}
                completedIds={completedIds}
                onSelectChallenge={(challenge) => navigate(`/workspace/${challenge._id}`)}
              />
            )}
            {activeTab === 'dashboard' && (
              <ProgressDashboard
                completedIds={completedIds}
                submissions={submissions}
                challenges={questions}
                onSelectChallenge={(challenge) => navigate(`/workspace/${challenge._id}`)}
              />
            )}
            {activeTab === 'notes' && (
              <NotesView
                challenges={questions}
                onSelectChallenge={(challenge) => navigate(`/workspace/${challenge._id}`)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default LearnerDashboard;
