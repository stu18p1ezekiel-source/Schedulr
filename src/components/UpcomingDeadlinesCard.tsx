import React from 'react';
import { 
  FlaskConical, 
  BookOpen, 
  Calculator, 
  Palette, 
  Languages, 
  Laptop, 
  Clock, 
  CheckCircle2, 
  Circle,
  AlertCircle
} from 'lucide-react';
import { HomeworkItem } from '../types';

interface UpcomingDeadlinesCardProps {
  homeworkList: HomeworkItem[];
  onToggleComplete: (id: string) => void;
  onViewAll: () => void;
  onOpenItem?: (item: HomeworkItem) => void;
}

export const UpcomingDeadlinesCard: React.FC<UpcomingDeadlinesCardProps> = ({
  homeworkList,
  onToggleComplete,
  onViewAll,
  onOpenItem,
}) => {
  // Sort homework: pending first, then by dueDate ascending
  const sortedDeadlines = [...homeworkList]
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 4);

  const getSubjectIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('physic') || s.includes('chem') || s.includes('bio') || s.includes('sci')) {
      return <FlaskConical className="w-5 h-5" />;
    }
    if (s.includes('hist') || s.includes('social') || s.includes('geo')) {
      return <BookOpen className="w-5 h-5" />;
    }
    if (s.includes('math') || s.includes('calc') || s.includes('alg')) {
      return <Calculator className="w-5 h-5" />;
    }
    if (s.includes('french') || s.includes('eng') || s.includes('lit') || s.includes('lang')) {
      return <Languages className="w-5 h-5" />;
    }
    if (s.includes('comp') || s.includes('tech') || s.includes('code')) {
      return <Laptop className="w-5 h-5" />;
    }
    return <Palette className="w-5 h-5" />;
  };

  const getSubjectColorStyles = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('physic') || s.includes('sci')) {
      return 'bg-[#ffdad6] text-[#93000a]';
    }
    if (s.includes('hist')) {
      return 'bg-[#e8f4f3] text-[#082142]';
    }
    if (s.includes('math')) {
      return 'bg-[#d2f2ef] text-[#082142]';
    }
    if (s.includes('chem')) {
      return 'bg-[#fef3c7] text-[#92400e]';
    }
    return 'bg-[#d2f2ef] text-[#139a91]';
  };

  const formatDueDate = (dateStr: string, timeStr?: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let prefix = '';
    if (diffDays === 0) prefix = 'Due Today';
    else if (diffDays === 1) prefix = 'Due Tomorrow';
    else if (diffDays === -1) prefix = 'Overdue';
    else {
      prefix = `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }

    return timeStr ? `${prefix}, ${timeStr}` : prefix;
  };

  return (
    <div 
      id="upcoming-deadlines-card" 
      className="bg-white rounded-2xl border border-[#cbe6e3] p-6 shadow-xs hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-xl font-bold font-serif text-[#082142]">Upcoming Deadlines</h3>
          <p className="text-xs text-[#40535e] mt-0.5">Assignments due this week</p>
        </div>
        <button 
          id="btn-view-all-deadlines"
          onClick={onViewAll}
          className="text-[#139a91] hover:text-[#0e8b83] text-xs font-bold px-3 py-1 rounded-full hover:bg-[#d2f2ef] transition-colors"
        >
          View All
        </button>
      </div>

      {sortedDeadlines.length === 0 ? (
        <div className="text-center py-6 text-[#75777f]">
          <p className="text-sm font-medium">No upcoming deadlines</p>
          <p className="text-xs mt-1">You are completely caught up!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sortedDeadlines.map((hw) => {
            const isCompleted = hw.completed;
            const colorClass = getSubjectColorStyles(hw.subject);

            return (
              <li 
                key={hw.id}
                id={`deadline-item-${hw.id}`}
                className={`flex items-start p-3.5 rounded-xl transition-all border ${
                  isCompleted 
                    ? 'bg-[#edf7f6]/50 border-transparent opacity-75' 
                    : 'bg-white hover:bg-[#f4f9f8] border-[#cbe6e3]/60 hover:border-[#139a91] hover:shadow-xs'
                } group`}
              >
                {/* Subject Icon Box */}
                <div className={`p-2.5 rounded-xl mr-3.5 shrink-0 ${colorClass}`}>
                  {getSubjectIcon(hw.subject)}
                </div>

                {/* Content */}
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onOpenItem?.(hw)}
                >
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-semibold text-[#082142] group-hover:text-[#139a91] transition-colors truncate ${
                      isCompleted ? 'line-through text-[#75777f]' : ''
                    }`}>
                      {hw.title}
                    </h4>
                    {hw.priority === 'high' && !isCompleted && (
                      <span className="shrink-0 text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#ffdad6] text-[#93000a]">
                        Urgent
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-[#40535e] mt-1">
                    <span className="font-semibold text-[#082142]">{hw.subject}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-[#139a91]" />
                      {formatDueDate(hw.dueDate, hw.dueTime)}
                    </span>
                  </div>
                </div>

                {/* Quick Check / Proof Indicator */}
                <button
                  id={`btn-toggle-hw-${hw.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenItem?.(hw);
                  }}
                  title={
                    hw.submissionStatus === 'approved' || hw.completed
                      ? "Verified by Teacher"
                      : hw.submissionStatus === 'pending_approval'
                      ? "Submitted • Awaiting Teacher Review"
                      : "Click to submit photo proof"
                  }
                  className="p-1.5 text-[#75777f] hover:text-[#139a91] rounded-lg hover:bg-[#d2f2ef] transition-colors ml-2 cursor-pointer"
                >
                  {hw.submissionStatus === 'approved' || hw.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : hw.submissionStatus === 'pending_approval' ? (
                    <Clock className="w-5 h-5 text-amber-600 fill-amber-100 animate-pulse" />
                  ) : (
                    <Circle className="w-5 h-5 hover:stroke-[#139a91]" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
