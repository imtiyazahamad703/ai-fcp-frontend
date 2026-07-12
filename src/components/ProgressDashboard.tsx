import { useState } from 'react';
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
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; count: number; x: number; y: number } | null>(null);

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

  // Generate last 7 days data for the curved chart
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const dailyCounts = last7Days.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    const daySubmissions = submissions.filter(
      s => s.status === 'pass' && new Date(s.createdAt).toISOString().split('T')[0] === dateStr
    );
    return {
      dayStr: date.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: dateStr,
      count: daySubmissions.length
    };
  });

  const maxCount = Math.max(...dailyCounts.map(d => d.count), 3);
  const chartHeight = 80;
  const points = dailyCounts.map((data, i) => {
    const x = 20 + i * 43.33;
    const y = 100 - (data.count / maxCount) * chartHeight;
    return { x, y, data };
  });

  const generateCurvePath = () => {
    if (points.length === 0) return "";
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const cx = (p1.x + p2.x) / 2;
      path += ` C ${cx} ${p1.y}, ${cx} ${p2.y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

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
        {/* Weekly Activity Curved Graph */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col relative min-h-[300px]">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">Weekly Activity</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Successful challenge submissions over the last 7 days.
            </p>
          </div>

          {/* Custom SVG Line Chart */}
          <div className="relative flex-1 w-full flex items-end justify-center">
            <svg viewBox="0 0 300 140" className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(79, 70, 229, 0.4)" />
                  <stop offset="100%" stopColor="rgba(79, 70, 229, 0.0)" />
                </linearGradient>
              </defs>

              {/* Grid lines (horizontal) */}
              {[20, 60, 100].map(y => (
                <line key={y} x1="20" y1={y} x2="280" y2={y} stroke="#e4e4e7" strokeWidth="1" strokeDasharray="4 4" className="dark:stroke-zinc-800" />
              ))}

              {/* X axis labels */}
              {points.map((p, i) => (
                <text key={i} x={p.x} y="130" textAnchor="middle" fontSize="10" fill="#a1a1aa" fontWeight="500">
                  {p.data.dayStr}
                </text>
              ))}

              {/* The Area */}
              <path 
                d={`${generateCurvePath()} L ${points[points.length - 1].x} 110 L ${points[0].x} 110 Z`} 
                fill="url(#curveGradient)" 
              />
              
              {/* The Line */}
              <path 
                d={generateCurvePath()} 
                fill="none" 
                stroke="rgb(79, 70, 229)" 
                strokeWidth="3" 
                strokeLinecap="round" 
              />

              {/* The Interactive Dots */}
              {points.map((p, i) => (
                <g 
                  key={i} 
                  onMouseEnter={() => setHoveredPoint({ day: p.data.fullDate, count: p.data.count, x: p.x, y: p.y })}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-crosshair"
                >
                  <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
                  <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="rgb(79, 70, 229)" strokeWidth="2" className="dark:fill-zinc-900 transition-all hover:scale-125 origin-center" />
                </g>
              ))}
            </svg>

            {/* Hover Tooltip overlay */}
            {hoveredPoint && (
              <div 
                className="absolute z-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-8px] transition-all"
                style={{ left: `${(hoveredPoint.x / 300) * 100}%`, top: `${(hoveredPoint.y / 140) * 100}%` }}
              >
                {new Date(hoveredPoint.day).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                <div className="text-center font-normal opacity-80 mt-0.5">{hoveredPoint.count} tasks completed</div>
                {/* Tooltip triangle tail */}
                <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full border-[5px] border-transparent border-t-zinc-900 dark:border-t-white" />
              </div>
            )}
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
