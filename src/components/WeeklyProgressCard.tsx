import React from 'react';
import { Award, CheckCircle2, TrendingUp } from 'lucide-react';

interface WeeklyProgressCardProps {
  completedCount: number;
  totalCount: number;
  onViewHomework: () => void;
}

export const WeeklyProgressCard: React.FC<WeeklyProgressCardProps> = ({
  completedCount,
  totalCount,
  onViewHomework,
}) => {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div 
      id="weekly-progress-card" 
      onClick={onViewHomework}
      className="bg-[#082142] text-white rounded-2xl p-6 shadow-md relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 border border-[#112f5a]"
    >
      {/* Decorative ambient BBS teal glow */}
      <div className="absolute -right-10 -top-10 w-44 h-44 bg-[#139a91] rounded-full opacity-25 group-hover:scale-110 transition-transform duration-700 blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-[#84f0e5] rounded-full opacity-10 blur-xl pointer-events-none" />

      <div className="flex items-center justify-between mb-2 relative z-10">
        <h3 className="text-2xl font-bold font-serif tracking-tight">Weekly Progress</h3>
        <div className="p-1.5 rounded-full bg-white/10 text-[#84f0e5]">
          <TrendingUp className="w-4 h-4" />
        </div>
      </div>

      <p className="text-sm text-[#b2d9d4] mb-5 relative z-10">
        {percentage >= 100 
          ? "Outstanding! All weekly BBS assignments completed." 
          : percentage >= 60 
          ? "Great momentum! Keep up the good work." 
          : "Stay focused on upcoming deadlines."}
      </p>

      <div className="flex items-end justify-between mb-2 relative z-10">
        <div className="flex items-baseline space-x-2">
          <span className="text-5xl font-serif font-bold text-white tracking-tight">
            {completedCount}
          </span>
          <span className="text-lg text-[#b2d9d4] font-medium pb-1">
            / {totalCount}
          </span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#139a91]/40 text-[#84f0e5] border border-[#84f0e5]/30">
          {percentage}% Done
        </span>
      </div>

      <p className="text-xs font-medium text-[#b2d9d4] mb-3 relative z-10">
        Assignments Completed
      </p>

      {/* Progress Bar with BBS Teal glow */}
      <div className="w-full bg-[#112f5a] rounded-full h-3 relative z-10 overflow-hidden p-0.5">
        <div 
          className="bg-gradient-to-r from-[#0c6f68] via-[#139a91] to-[#84f0e5] h-2 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(132,240,229,0.7)]"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#b2d9d4] relative z-10">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#84f0e5]" />
          <span>{totalCount - completedCount} tasks pending</span>
        </span>
        <span className="text-[#84f0e5] group-hover:underline font-semibold flex items-center gap-1">
          Open Planner →
        </span>
      </div>
    </div>
  );
};
