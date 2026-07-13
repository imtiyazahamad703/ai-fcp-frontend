import { useState, useEffect } from "react";
import { Search, Code2, Layers, BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";
import type { IQuestion } from "../types";

interface ChallengeListProps {
  challenges: IQuestion[];
  completedIds: string[];
  submissions?: any[];
  onSelectChallenge: (challenge: IQuestion) => void;
}

export const ChallengeList = ({
  challenges,
  completedIds,
  submissions,
  onSelectChallenge,
}: ChallengeListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [attemptFilter, setAttemptFilter] = useState<string>("All");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, attemptFilter]);

  const filteredChallenges = challenges.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Map category
    const category = c.type === 'react' ? 'Frontend' : 'Fullstack';
    const matchesCategory = categoryFilter === "All" || category === categoryFilter;
    
    // Map Attempt status
    const submission = submissions?.find(s => s.questionId === c._id || s.questionId?.toString() === c._id);
    const attempts = submission?.attempts || 0;
    
    let matchesAttempt = true;
    if (attemptFilter === "Attempted") matchesAttempt = attempts > 0;
    else if (attemptFilter === "Unattempted") matchesAttempt = attempts === 0;
    
    return matchesSearch && matchesCategory && matchesAttempt;
  });

  const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage);
  const paginatedChallenges = filteredChallenges.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );



  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Frontend":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30";
      case "Fullstack":
        return "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/30";
      default:
        return "text-zinc-600 bg-zinc-50 border-zinc-200";
    }
  };

  return (
    <div className="px-8 pb-8">
      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search challenges..."
            className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Multi Filters */}
        <div className="flex gap-2 w-full md:w-auto">
          {/* Tech Stack Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-700 dark:text-zinc-300 w-full md:w-auto"
          >
            <option value="All">All Categories</option>
            <option value="Frontend">Frontend Only</option>
            <option value="Fullstack">Fullstack Only</option>
          </select>

          {/* Attempt Status Filter */}
          <select
            value={attemptFilter}
            onChange={(e) => setAttemptFilter(e.target.value)}
            className="text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-700 dark:text-zinc-300 w-full md:w-auto"
          >
            <option value="All">All Statuses</option>
            <option value="Attempted">Attempted</option>
            <option value="Unattempted">Unattempted</option>
          </select>
        </div>
      </div>

      {/* Grid of Challenges */}
      {filteredChallenges.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/10">
          <BookOpen className="mx-auto h-8 w-8 text-zinc-400" />
          <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">No challenges found</h3>
          <p className="mt-1 text-xs text-zinc-400">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedChallenges.map((challenge) => {
            const challengeId = challenge._id || '';
            const isCompleted = completedIds.includes(challengeId);
            const fileCount = challenge.starterCode?.length || 0;
            const testCount = challenge.testCases?.length || 0;
            const category = challenge.type === 'react' ? 'Frontend' : 'Fullstack';
            const submission = submissions?.find(s => s.questionId === challengeId || s.questionId?.toString() === challengeId);
            const attempts = submission?.attempts || 0;

            return (
              <div
                key={challengeId}
                className="group relative flex flex-col justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-200"
              >
                {/* Header Info */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryColor(category)}`}>
                      {category}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 px-2 py-0.5 rounded-md shadow-sm">
                      {attempts} {attempts === 1 ? "Attempt" : "Attempts"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-2 line-clamp-1">
                    {challenge.title}
                  </h3>

                  <p className="text-xs text-zinc-400 dark:text-zinc-500 line-clamp-2 leading-relaxed mb-4">
                    {challenge.description.replace(/[#*`[\]()]/g, "")}
                  </p>
                </div>

                {/* Footer Meta & Button */}
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                  {/* File & Test Stats */}
                  <div className="flex gap-3 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Code2 size={12} /> {fileCount} {fileCount === 1 ? "file" : "files"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers size={12} /> {testCount} {testCount === 1 ? "test" : "tests"}
                    </span>
                  </div>

                  {/* Complete Check / CTA */}
                  <div className="flex items-center space-x-2">
                    {isCompleted && (
                      <span className="text-green-500 flex items-center text-[10px] font-bold gap-1 mr-1" title="Solved">
                        <CheckCircle2 size={12} /> Passed
                      </span>
                    )}
                    <button
                      onClick={() => onSelectChallenge(challenge)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-zinc-900 hover:bg-indigo-600 dark:bg-zinc-800 dark:hover:bg-indigo-600 text-white rounded-lg transition duration-150 cursor-pointer"
                    >
                      <span>Solve</span>
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredChallenges.length)} of {filteredChallenges.length} challenges
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
