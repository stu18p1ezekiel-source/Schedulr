import React from 'react';
import { Plus, CheckSquare, CalendarPlus, Shield, User, Bell, Sparkles, LogOut, Radio, RefreshCw } from 'lucide-react';
import { ActiveTab, Student, Teacher } from '../types';

interface TopHeaderProps {
  activeTab: ActiveTab;
  currentStudent: Student | null;
  currentTeacher?: Teacher | null;
  currentMonthName: string;
  currentYear: number;
  onOpenAddHomework: () => void;
  onOpenAddEvent?: () => void;
  isTeacherMode: boolean;
  onToggleTeacherMode: () => void;
  onLogout?: () => void;
  isLiveSynced?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  currentStudent,
  currentTeacher,
  currentMonthName,
  currentYear,
  onOpenAddHomework,
  onOpenAddEvent,
  isTeacherMode,
  onToggleTeacherMode,
  onLogout,
  isLiveSynced = true,
}) => {
  const getGreeting = () => {
    if (isTeacherMode && currentTeacher) {
      return `Welcome, ${currentTeacher.name}`;
    }
    const studentName = currentStudent?.name?.split(' ')[0] || 'Student';
    return `Welcome back, ${studentName}`;
  };

  const getSubtext = () => {
    if (isTeacherMode) {
      return `Faculty Portal • ${currentTeacher?.role || 'Academic Department'} • Manage schedules and events across all classes.`;
    }
    switch (activeTab) {
      case 'calendar':
        return 'Manage your Bina Bangsa academic schedule, exams, and extracurricular events.';
      case 'homework':
        return 'Stay on top of assignments, lab reports, and upcoming homework deadlines.';
      case 'posts':
        return 'Official Bina Bangsa School bulletins, advisor notices, and department updates.';
      case 'profile':
        return 'Review your student record, enrolled courses, and academic achievements.';
      case 'admin':
        return 'Faculty Admin Portal: schedule school events, publish bulletins & target assignments.';
      case 'home':
      default:
        return 'Here is your daily BBS academic schedule and upcoming milestone tracker.';
    }
  };

  return (
    <header id="app-top-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#082142] tracking-tight">
            {activeTab === 'calendar' ? `${currentMonthName} ${currentYear}` : getGreeting()}
          </h2>
          {isTeacherMode ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#082142] text-white">
              <Shield className="w-3 h-3 text-[#139a91]" />
              Faculty Portal
            </span>
          ) : (
            currentStudent && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#d2f2ef] text-[#074e48]">
                <User className="w-3 h-3 text-[#139a91]" />
                Class {currentStudent.classId}
              </span>
            )
          )}

          {/* Real-time Multi-Device Sync Indicator */}
          <span 
            title="Real-time multi-device database synchronized" 
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync</span>
          </span>
        </div>
        <p className="text-sm sm:text-base text-[#40535e] mt-1 max-w-2xl">
          {getSubtext()}
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Prominent + Add Homework Button */}
        <button
          id="btn-add-homework-top"
          onClick={onOpenAddHomework}
          className="bg-[#139a91] hover:bg-[#0e8b83] text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Homework</span>
        </button>

        {/* Add Event Button (for teacher admin or rapid event creation) */}
        {onOpenAddEvent && (
          <button
            id="btn-add-event-top"
            onClick={onOpenAddEvent}
            className="bg-[#e6f3f1] hover:bg-[#d8ecea] text-[#082142] border border-[#cbe6e3] px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4 text-[#139a91]" />
            <span className="hidden sm:inline">Add Event</span>
          </button>
        )}

        {/* Sign Out Shortcut Button */}
        {onLogout && (
          <button
            id="btn-top-logout"
            onClick={onLogout}
            title="Log Out"
            className="p-2.5 rounded-full border border-[#cbe6e3] text-[#40535e] hover:text-[#ba1a1a] hover:bg-[#ffebee] hover:border-[#ffcdd2] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
