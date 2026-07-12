import { Award, Zap, TrendingUp, Compass, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { IQuestion } from "../types";

interface ProgressDashboardProps {
  completedIds: string[];
  submissions: any[];
  challenges: IQuestion[];
  onSelectChallenge: (challenge: IQuestion) => void;
}

export const ProgressDashboard = ({
  completedIds,
  submissions,
  challenges,
  onSelectChallenge,
}: ProgressDashboardProps) => {
  const completedCount = completedIds.length;
  const totalCount = challenges.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // Calculate scores dynamically based on types of completed challenges
  const completedChallengesList = challenges.filter(c => completedIds.includes(c._id || ''));
  const frontendScore = completedChallengesList.filter(c => c.type === 'react').length * 100;
  const backendScore = completedChallengesList.filter(c => c.type === 'fullstack').length * 150;
  const totalScore = frontendScore + backendScore;

  // Streak logic (derived from unique submission dates or default)
  const uniqueSubmissionDates = new Set(
    submissions.map(s => new Date(s.createdAt).toISOString().split('T')[0])
  );
  const streakCount = uniqueSubmissionDates.size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[22px] pb-8">
      {/* Dashboard Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight font-sans">
          Personal Skill Analytics
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Track your real-world engineering metrics, core capabilities, and full-stack learning achievements.
        </p>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        {/* Stat 1: Completed */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full translate-x-8 -translate-y-8" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Completed</span>
            <Award className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">{completedCount}</span>
            <span className="text-xs text-zinc-400">/ {totalCount} tasks</span>
          </div>
          <div className="mt-2.5 flex items-center space-x-2">
            <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${completionRate}%` }} />
            </div>
            <span className="text-[10px] font-bold text-zinc-500 font-mono">{completionRate}%</span>
          </div>
        </div>

        {/* Stat 2: Streak */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full translate-x-8 -translate-y-8" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Practice Streak</span>
            <Zap className="h-5 w-5 text-amber-500 animate-bounce" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">{streakCount}</span>
            <span className="text-xs text-zinc-400">days active</span>
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-3 font-semibold">
            {streakCount > 0 ? "You're on fire! Keep code-building today." : "No active streak. Start a challenge to build today!"}
          </p>
        </div>

        {/* Stat 3: Mastery Score */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full translate-x-8 -translate-y-8" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Mastery Points</span>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">{totalScore}</span>
            <span className="text-xs text-zinc-400">Points</span>
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-3 font-semibold">
            Earn 100 points for Frontend, 150 points for Fullstack passing solutions.
          </p>
        </div>

        {/* Stat 4: Engineering Ratio */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full translate-x-8 -translate-y-8" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Expertise Bias</span>
            <Compass className="h-5 w-5 text-purple-500" />
          </div>
          <div className="space-y-2 mt-1">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold">
              <span className="text-blue-500">Frontend ({frontendScore})</span>
              <span className="text-purple-500">Fullstack ({backendScore})</span>
            </div>
            {/* Split bar diagram */}
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 flex overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: `${frontendScore + backendScore > 0 ? (frontendScore / totalScore) * 100 : 50}%` }} />
              <div className="bg-purple-500 h-full" style={{ width: `${frontendScore + backendScore > 0 ? (backendScore / totalScore) * 100 : 50}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Skills Chart (Custom-crafted Vector SVG) */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">Full-Stack Core Profile</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Visual map illustrating your current competence levels compared to professional standards.
            </p>
          </div>

          {/* SVG Custom Graph */}
          <div className="flex items-center justify-center py-4 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-lg border border-zinc-100 dark:border-zinc-800/40">
            <svg viewBox="0 0 200 200" className="w-40 h-40">
              {/* Spiderweb guide lines */}
              <circle cx="100" cy="100" r="80" stroke="#eaeaea" strokeWidth="1" fill="none" className="dark:stroke-zinc-800" />
              <circle cx="100" cy="100" r="55" stroke="#eaeaea" strokeWidth="1" fill="none" className="dark:stroke-zinc-800" />
              <circle cx="100" cy="100" r="30" stroke="#eaeaea" strokeWidth="1" fill="none" className="dark:stroke-zinc-800" />
              <line x1="100" y1="20" x2="100" y2="180" stroke="#eaeaea" strokeWidth="1" className="dark:stroke-zinc-800" />
              <line x1="20" y1="100" x2="180" y2="100" stroke="#eaeaea" strokeWidth="1" className="dark:stroke-zinc-800" />

              {/* Labels */}
              <text x="100" y="15" textAnchor="middle" fontSize="8" fill="#a1a1aa" fontWeight="bold">UX/Design</text>
              <text x="100" y="192" textAnchor="middle" fontSize="8" fill="#a1a1aa" fontWeight="bold">APIs/Routing</text>
              <text x="185" y="103" textAnchor="start" fontSize="8" fill="#a1a1aa" fontWeight="bold">State</text>
              <text x="15" y="103" textAnchor="end" fontSize="8" fill="#a1a1aa" fontWeight="bold">Integration</text>

              {/* Draw profile polygon based on actual scores */}
              {(() => {
                const limitMax = 500;
                // Calculate point positions dynamically based on completion stats
                const topVal = Math.min(80, 20 + (80 * (1 - frontendScore / limitMax)));
                const rightVal = Math.min(180, 100 + (80 * (frontendScore / limitMax)));
                const bottomVal = Math.min(180, 100 + (80 * (backendScore / limitMax)));
                const leftVal = Math.max(20, 100 - (80 * (backendScore / limitMax)));

                const pointsStr = `100,${topVal} ${rightVal},100 100,${bottomVal} ${leftVal},100`;

                return (
                  <>
                    <polygon
                      points={pointsStr}
                      fill="rgba(79, 70, 229, 0.15)"
                      stroke="rgb(79, 70, 229)"
                      strokeWidth="2"
                    />
                    {/* Vertices */}
                    <circle cx="100" cy={topVal} r="3" fill="rgb(79, 70, 229)" />
                    <circle cx={rightVal} cy="100" r="3" fill="rgb(79, 70, 229)" />
                    <circle cx="100" cy={bottomVal} r="3" fill="rgb(79, 70, 229)" />
                    <circle cx={leftVal} cy="100" r="3" fill="rgb(79, 70, 229)" />
                  </>
                );
              })()}
            </svg>
          </div>

          <div className="text-[10px] text-zinc-400 mt-2 text-center font-semibold">
            Solve more tasks to expand your polygon vertices dynamically!
          </div>
        </div>

        {/* History Log Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">Submissions History</h3>
              <p className="text-xs text-zinc-400">
                A granular record of all your compiling attempts and execution outcomes.
              </p>
            </div>
          </div>

          {/* Table-like entries */}
          <div className="flex-1 overflow-y-auto max-h-[220px] pr-1 space-y-2.5">
            {submissions.length === 0 ? (
              <div className="text-center py-10 text-zinc-400 text-xs">
                No past submissions logged yet. Start working on a challenge to see activity.
              </div>
            ) : (
              submissions.map((sub) => {
                const associated = challenges.find((ch) => ch._id === sub.questionId);
                const isPass = sub.status === "pass";

                return (
                  <div
                    key={sub._id}
                    className="flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 rounded-lg transition"
                  >
                    <div className="flex items-center space-x-3">
                      {isPass ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <div
                          onClick={() => associated && onSelectChallenge(associated)}
                          className="text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition line-clamp-1"
                        >
                          {associated ? associated.title : "Unknown Challenge"}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(sub.updatedAt || sub.createdAt).toLocaleDateString()} at{" "}
                          {new Date(sub.updatedAt || sub.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        isPass ? "bg-green-100 dark:bg-green-950/20 text-green-600" : "bg-red-100 dark:bg-red-950/20 text-red-600"
                      }`}>
                        {isPass ? "Passed" : "Failed"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
