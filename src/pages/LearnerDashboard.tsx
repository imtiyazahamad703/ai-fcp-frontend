import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Layers, ArrowLeft } from 'lucide-react';
import { learnerService } from '../services/learner.service';
import type { IQuestion } from '../types';
import { Sidebar } from '../components/Sidebar';
import { ChallengeList } from '../components/ChallengeList';
import { ProgressDashboard } from '../components/ProgressDashboard';
import { NotesView } from '../components/NotesView';

const LearnerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'challenges' | 'dashboard' | 'notes'>('challenges');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
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
            {activeTab === 'challenges' && !selectedFolder && (
              <div className="p-8">
                <div className="mb-10">
                  <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3">
                    Full-Stack Feature Lab
                  </h1>
                  <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                    Level up by building actual system components, APIs, and responsive React modules inside our live workspace IDE, evaluated in real time by NestJS backend test runners.
                  </p>
                </div>

                <div className="flex items-center gap-2 mb-6 px-1">
                  <FolderOpen className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Your Collections</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from(new Set(questions.map(q => q.folder || 'Uncategorized'))).map(folder => {
                    const folderQuestions = questions.filter(q => (q.folder || 'Uncategorized') === folder);
                    const totalCount = folderQuestions.length;
                    const completedCount = folderQuestions.filter(q => completedIds.includes(q._id!)).length;
                    
                    const progressPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

                    return (
                      <div 
                        key={folder} 
                        onClick={() => setSelectedFolder(folder)}
                        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                      >
                        {/* Decorative background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-500/5 dark:to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative z-10 flex flex-col items-start w-full">
                          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-indigo-100 dark:border-indigo-500/20">
                            <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors capitalize">
                            {folder}
                          </h3>
                          
                          <div className="w-full mt-auto">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                {completedCount} / {totalCount} Completed
                              </span>
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                {progressPercentage}%
                              </span>
                            </div>
                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-indigo-500 dark:bg-indigo-400 h-1.5 rounded-full transition-all duration-500" 
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {activeTab === 'challenges' && selectedFolder && (
              <div className="flex flex-col h-full">
                <div className="px-8 pt-8 pb-4">
                  <button 
                    onClick={() => setSelectedFolder(null)} 
                    className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition mb-4"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Collections
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                      <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 capitalize">{selectedFolder}</h2>
                  </div>
                </div>
                <ChallengeList
                  challenges={questions.filter(q => (q.folder || 'Uncategorized') === selectedFolder)}
                  completedIds={completedIds}
                  submissions={submissions}
                  onSelectChallenge={(challenge) => navigate(`/workspace/${challenge._id}`)}
                />
              </div>
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
