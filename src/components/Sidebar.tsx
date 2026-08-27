import React from 'react';
import { 
  Home, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  MessageSquare, 
  User, 
  ShieldCheck, 
  LogOut,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { ActiveTab, Student, Teacher } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentStudent: Student | null;
  currentTeacher?: Teacher | null;
  isTeacherMode: boolean;
  setIsTeacherMode: (isTeacher: boolean) => void;
  onOpenLogin: () => void;
  onOpenTeacherLogin: () => void;
  onLogout?: () => void;
  pendingHomeworkCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentStudent,
  currentTeacher,
  isTeacherMode,
  setIsTeacherMode,
  onOpenLogin,
  onOpenTeacherLogin,
  onLogout,
  pendingHomeworkCount,
}) => {
  const defaultAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBs0lMiiUNA8Xyb29FU_89TYEXd_Kijqh3mgpnGFsaWluEaAkRBugGs_0uwQiYL82lRYA9InyqbHZieKBbFqoloOYqucrGZ3tKNrMmuGsZIdq41olHGpoGMkZJhHNqYqa3X9TGAf8aswUVlg8SNAB_AWkpV0Kx5xM7OK_CUw-GnhfuusbpqExunH_lu57KYzaebjGxHaWAXRwWwFkP61qjSwTx2map5ePYAxXW2Tz8GTDaAEXDEY5c';

  return (
    <aside 
      id="main-sidebar" 
      className="bg-[#edf7f6] text-[#082142] h-full w-72 rounded-r-2xl shadow-xs hidden md:flex flex-col p-6 space-y-2 shrink-0 z-20 border-r border-[#cbe6e3]"
    >
      {/* School Header */}
      <div className="mb-6 flex flex-col items-start border-b border-[#cbe6e3]/60 pb-5">
        <div className="mb-2">
          <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#139a91] text-white">
            Official Portal
          </span>
          <h1 className="text-2xl font-bold font-serif tracking-tight text-[#082142] mt-1">
            BBS Scheduler
          </h1>
        </div>
        <p className="text-xs text-[#40535e] font-medium pl-0.5">Bina Bangsa School • Academic Schedule</p>
      </div>

      {/* Navigation Links */}
      <div className="space-y-1.5 flex-1">
        <button
          id="nav-btn-home"
          onClick={() => setActiveTab('home')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-sm font-medium transition-all ${
            activeTab === 'home'
              ? 'bg-[#139a91] text-white font-bold shadow-xs'
              : 'text-[#40535e] hover:bg-[#d8ecea] hover:text-[#082142]'
          }`}
        >
          <div className="flex items-center">
            <Home className="w-5 h-5 mr-3 shrink-0" />
            <span>Home</span>
          </div>
        </button>

        <button
          id="nav-btn-calendar"
          onClick={() => setActiveTab('calendar')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-sm font-medium transition-all ${
            activeTab === 'calendar'
              ? 'bg-[#139a91] text-white font-bold shadow-xs'
              : 'text-[#40535e] hover:bg-[#d8ecea] hover:text-[#082142]'
          }`}
        >
          <div className="flex items-center">
            <CalendarIcon className="w-5 h-5 mr-3 shrink-0" />
            <span>Calendar</span>
          </div>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
            activeTab === 'calendar' ? 'bg-white/20 text-white' : 'bg-[#082142]/10 text-[#082142]'
          }`}>
            Main
          </span>
        </button>

        <button
          id="nav-btn-homework"
          onClick={() => setActiveTab('homework')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-sm font-medium transition-all ${
            activeTab === 'homework'
              ? 'bg-[#139a91] text-white font-bold shadow-xs'
              : 'text-[#40535e] hover:bg-[#d8ecea] hover:text-[#082142]'
          }`}
        >
          <div className="flex items-center">
            <CheckSquare className="w-5 h-5 mr-3 shrink-0" />
            <span>Homework</span>
          </div>
          {pendingHomeworkCount > 0 && (
            <span className="text-xs font-bold bg-[#ba1a1a] text-white px-2 py-0.5 rounded-full">
              {pendingHomeworkCount}
            </span>
          )}
        </button>

        <button
          id="nav-btn-posts"
          onClick={() => setActiveTab('posts')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-sm font-medium transition-all ${
            activeTab === 'posts'
              ? 'bg-[#139a91] text-white font-bold shadow-xs'
              : 'text-[#40535e] hover:bg-[#d8ecea] hover:text-[#082142]'
          }`}
        >
          <div className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-3 shrink-0" />
            <span>Teacher Posts</span>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#139a91] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#139a91]"></span>
          </span>
        </button>

        <button
          id="nav-btn-profile"
          onClick={() => setActiveTab('profile')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-sm font-medium transition-all ${
            activeTab === 'profile'
              ? 'bg-[#139a91] text-white font-bold shadow-xs'
              : 'text-[#40535e] hover:bg-[#d8ecea] hover:text-[#082142]'
          }`}
        >
          <div className="flex items-center">
            <User className="w-5 h-5 mr-3 shrink-0" />
            <span>Student Profile</span>
          </div>
        </button>

        {/* Teacher Admin Panel Tab */}
        <div className="pt-4 mt-4 border-t border-[#cbe6e3]">
          <button
            id="nav-btn-admin"
            onClick={() => {
              if (isTeacherMode) {
                setActiveTab('admin');
              } else {
                onOpenTeacherLogin();
              }
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
              activeTab === 'admin'
                ? 'bg-[#082142] text-white shadow-md'
                : isTeacherMode
                ? 'bg-[#d2f2ef] text-[#082142] hover:bg-[#c2eae6]'
                : 'bg-white/80 border border-[#cbe6e3] text-[#082142] hover:bg-white shadow-xs'
            }`}
          >
            <div className="flex items-center">
              <ShieldCheck className={`w-5 h-5 mr-3 shrink-0 ${isTeacherMode ? 'text-[#139a91]' : 'text-[#75777f]'}`} />
              <div className="text-left">
                <span className="block font-semibold">Teacher Admin</span>
                <span className="block text-[11px] text-[#40535e]">
                  {isTeacherMode ? 'Management Active' : 'Restricted Access'}
                </span>
              </div>
            </div>
            {isTeacherMode && (
              <span className="w-2 h-2 rounded-full bg-[#139a91]"></span>
            )}
          </button>
        </div>
      </div>

      {/* User Profile / Portal Footer Card */}
      <div className="mt-auto pt-4 border-t border-[#cbe6e3] space-y-2">
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-[#cbe6e3] flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <img 
              id="sidebar-user-avatar"
              className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-[#139a91]" 
              src={
                isTeacherMode
                  ? currentTeacher?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
                  : currentStudent?.avatarUrl || defaultAvatar
              }
              alt={isTeacherMode ? currentTeacher?.name || 'Teacher' : currentStudent?.name || 'Student'}
              referrerPolicy="no-referrer"
            />
            <div className="truncate">
              <p className="text-sm font-semibold text-[#082142] truncate">
                {isTeacherMode ? currentTeacher?.name || 'Faculty Member' : currentStudent?.name || 'Student Account'}
              </p>
              <p className="text-xs text-[#139a91] font-medium truncate">
                {isTeacherMode ? 'Teacher Admin' : currentStudent?.classId || 'JC1-A'}
              </p>
            </div>
          </div>
          <button
            id="sidebar-switch-account-btn"
            onClick={onOpenLogin}
            title={isTeacherMode ? 'Switch Teacher / Portal' : 'Switch Student / Class'}
            className="p-2 rounded-xl text-[#40535e] hover:text-[#082142] hover:bg-[#d8ecea] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {onLogout && (
          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffebee] border border-transparent hover:border-[#ffcdd2] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of BBS Scheduler</span>
          </button>
        )}
      </div>
    </aside>
  );
};
