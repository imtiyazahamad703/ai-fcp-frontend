import { useState } from "react";
import { Search, Code2, Layers, BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";
import type { IQuestion } from "../types";

interface ChallengeListProps {
  challenges: IQuestion[];
  completedIds: string[];
  onSelectChallenge: (challenge: IQuestion) => void;
}

export const ChallengeList = ({
  challenges,
  completedIds,
  onSelectChallenge,
}: ChallengeListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");

  const filteredChallenges = challenges.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Map category
    const category = c.type === 'react' ? 'Frontend' : 'Fullstack';
    const matchesCategory = categoryFilter === "All" || category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "All" || c.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy":
        return "text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400 border-green-200 dark:border-green-800/30";
      case "medium":
        return "text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30";
      case "hard":
        return "text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-800/30";
      default:
        return "text-zinc-600 bg-zinc-50 border-zinc-200";
    }
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[22px] pb-8">
      {/* Intro Hero Section */}
      <div className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 font-sans tracking-tight">
          Full-Stack Feature Lab
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Level up by building actual system components, APIs, and responsive React modules inside our live workspace IDE, evaluated in real time by NestJS backend test runners.
        </p>
      </div>

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

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-700 dark:text-zinc-300 w-full md:w-auto"
          >
            <option value="All">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
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
          {filteredChallenges.map((challenge) => {
            const challengeId = challenge._id || '';
            const isCompleted = completedIds.includes(challengeId);
            const fileCount = challenge.starterCode?.length || 0;
            const testCount = challenge.testCases?.length || 0;
            const category = challenge.type === 'react' ? 'Frontend' : 'Fullstack';

            return (
              <div
                key={challengeId}
                className="group relative flex flex-col justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-200"
              >
                {/* Header Info */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryColor(category)}`}>
                      {category}
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
    </div>
  );
};
