import React from 'react';
import { Home, Calendar as CalendarIcon, CheckSquare, MessageSquare, User, ShieldCheck } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isTeacherMode: boolean;
  onOpenTeacherLogin: () => void;
  pendingHomeworkCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  isTeacherMode,
  onOpenTeacherLogin,
  pendingHomeworkCount,
}) => {
  return (
    <nav 
      id="mobile-bottom-nav" 
      className="md:hidden fixed bottom-0 left-0 right-0 w-full z-40 bg-white/95 backdrop-blur-md border-t border-[#cbe6e3] shadow-lg flex justify-around items-center h-16 pb-safe px-2"
    >
      <button
        id="mobile-nav-home"
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          activeTab === 'home'
            ? 'text-[#139a91] font-bold bg-[#d2f2ef]'
            : 'text-[#40535e] hover:text-[#082142]'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Home</span>
      </button>

      <button
        id="mobile-nav-calendar"
        onClick={() => setActiveTab('calendar')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
          activeTab === 'calendar'
            ? 'text-[#139a91] font-bold bg-[#d2f2ef]'
            : 'text-[#40535e] hover:text-[#082142]'
        }`}
      >
        <CalendarIcon className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Calendar</span>
      </button>

      <button
        id="mobile-nav-homework"
        onClick={() => setActiveTab('homework')}
        className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          activeTab === 'homework'
            ? 'text-[#139a91] font-bold bg-[#d2f2ef]'
            : 'text-[#40535e] hover:text-[#082142]'
        }`}
      >
        <CheckSquare className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Homework</span>
        {pendingHomeworkCount > 0 && (
          <span className="absolute top-0 right-1.5 w-4 h-4 bg-[#ba1a1a] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {pendingHomeworkCount}
          </span>
        )}
      </button>

      <button
        id="mobile-nav-posts"
        onClick={() => setActiveTab('posts')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          activeTab === 'posts'
            ? 'text-[#139a91] font-bold bg-[#d2f2ef]'
            : 'text-[#40535e] hover:text-[#082142]'
        }`}
      >
        <MessageSquare className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Posts</span>
      </button>

      <button
        id="mobile-nav-profile"
        onClick={() => setActiveTab('profile')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          activeTab === 'profile'
            ? 'text-[#139a91] font-bold bg-[#d2f2ef]'
            : 'text-[#40535e] hover:text-[#082142]'
        }`}
      >
        <User className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Profile</span>
      </button>

      <button
        id="mobile-nav-teacher"
        onClick={() => {
          if (isTeacherMode) {
            setActiveTab('admin');
          } else {
            onOpenTeacherLogin();
          }
        }}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          activeTab === 'admin'
            ? 'text-[#082142] font-bold bg-[#d2f2ef]'
            : 'text-[#75777f] hover:text-[#082142]'
        }`}
      >
        <ShieldCheck className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Teacher</span>
      </button>
    </nav>
  );
};
