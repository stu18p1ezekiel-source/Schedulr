import React from 'react';
import { 
  User, 
  GraduationCap, 
  Mail, 
  Award, 
  CheckCircle2, 
  Clock, 
  LogOut, 
  ShieldCheck,
  BookOpen,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Student, HomeworkItem } from '../types';

interface ProfileViewProps {
  currentStudent: Student | null;
  homeworkList: HomeworkItem[];
  onOpenLogin: () => void;
  onOpenTeacherLogin: () => void;
  isTeacherMode: boolean;
  onSwitchStudent: (student: Student) => void;
  onLogout?: () => void;
  allStudents: Student[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentStudent,
  homeworkList,
  onOpenLogin,
  onOpenTeacherLogin,
  isTeacherMode,
  onSwitchStudent,
  onLogout,
  allStudents,
}) => {
  const defaultAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBs0lMiiUNA8Xyb29FU_89TYEXd_Kijqh3mgpnGFsaWluEaAkRBugGs_0uwQiYL82lRYA9InyqbHZieKBbFqoloOYqucrGZ3tKNrMmuGsZIdq41olHGpoGMkZJhHNqYqa3X9TGAf8aswUVlg8SNAB_AWkpV0Kx5xM7OK_CUw-GnhfuusbpqExunH_lu57KYzaebjGxHaWAXRwWwFkP61qjSwTx2map5ePYAxXW2Tz8GTDaAEXDEY5c';

  const myHomework = homeworkList.filter(h => {
    if (!currentStudent) return true;
    if (h.targetAudience === 'ALL') return true;
    if (h.targetAudience === 'CLASS') return !h.targetClass || h.targetClass === currentStudent.classId;
    if (h.targetAudience === 'SPECIFIC_STUDENTS') return h.targetStudentIds?.includes(currentStudent.id) || h.studentId === currentStudent.id;
    return true;
  });

  const completedCount = myHomework.filter(h => h.completed).length;
  const pendingCount = myHomework.filter(h => !h.completed).length;
  const completionRate = myHomework.length > 0 ? Math.round((completedCount / myHomework.length) * 100) : 0;

  return (
    <div id="profile-view-page" className="max-w-4xl mx-auto space-y-6">
      {/* Student Profile Header Card */}
      <div className="bg-white rounded-2xl border border-[#cbe6e3] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <img
            src={currentStudent?.avatarUrl || defaultAvatar}
            alt={currentStudent?.name || 'Student Account'}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#139a91] shadow-md shrink-0"
            referrerPolicy="no-referrer"
          />

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#082142]">
                  {currentStudent?.name || 'Student Account'}
                </h3>
                <p className="text-sm font-semibold text-[#139a91]">
                  Bina Bangsa High School • Senior Secondary
                </p>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-end flex-wrap">
                <button
                  id="btn-switch-account"
                  onClick={onOpenLogin}
                  className="px-4 py-2 rounded-full border border-[#cbe6e3] text-xs font-semibold text-[#082142] hover:bg-[#edf7f6] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Switch Student</span>
                </button>

                {onLogout && (
                  <button
                    id="btn-profile-logout"
                    onClick={onLogout}
                    className="px-4 py-2 rounded-full border border-[#ffcdd2] text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffebee] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 text-xs text-[#40535e]">
              <span className="px-3 py-1 rounded-full bg-[#edf7f6] font-semibold text-[#082142] border border-[#cbe6e3]">
                Class: {currentStudent?.classId || 'Grade 11-A'}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#edf7f6] font-semibold text-[#082142] border border-[#cbe6e3]">
                Student ID: {currentStudent?.rollNumber || '11A-14'}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#d2f2ef] font-semibold text-[#074e48]">
                Active Enrolled
              </span>
            </div>

            <p className="text-xs text-[#75777f] flex items-center justify-center sm:justify-start gap-1.5 pt-1">
              <Mail className="w-3.5 h-3.5 text-[#139a91]" />
              <span>{currentStudent?.email || 'stu17k1.nicholas@binabangsaschool.com'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Academic Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#cbe6e3] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#75777f] font-semibold uppercase tracking-wider mb-2">
            <span>Completion Rate</span>
            <Award className="w-4 h-4 text-[#139a91]" />
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-3xl font-serif font-bold text-[#082142]">{completionRate}%</h4>
            <span className="text-xs text-[#139a91] font-semibold">On Track</span>
          </div>
          <div className="w-full bg-[#edf7f6] rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-[#139a91] h-2 rounded-full transition-all duration-500" 
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#cbe6e3] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#75777f] font-semibold uppercase tracking-wider mb-2">
            <span>Completed Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-[#139a91]" />
          </div>
          <h4 className="text-3xl font-serif font-bold text-[#139a91]">{completedCount}</h4>
          <p className="text-xs text-[#75777f] mt-1">Assignments archived this term</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#cbe6e3] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#75777f] font-semibold uppercase tracking-wider mb-2">
            <span>Pending Deadlines</span>
            <Clock className="w-4 h-4 text-[#ba1a1a]" />
          </div>
          <h4 className="text-3xl font-serif font-bold text-[#ba1a1a]">{pendingCount}</h4>
          <p className="text-xs text-[#75777f] mt-1">Requires student attention</p>
        </div>
      </div>

      {/* Quick Switch to Classmates */}
      <div className="bg-white rounded-2xl border border-[#cbe6e3] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-serif font-bold text-[#082142]">BBS Class Roster (Student Switcher)</h4>
            <p className="text-xs text-[#40535e]">
              Click any student to test personalized view (including class-targeted assignments & Olympiad events).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {allStudents.map((st) => {
            const isSelected = currentStudent?.id === st.id;
            return (
              <button
                key={st.id}
                onClick={() => onSwitchStudent(st)}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  isSelected
                    ? 'bg-[#d2f2ef] border-[#139a91] ring-1 ring-[#139a91]'
                    : 'bg-[#f4f9f8] border-[#cbe6e3] hover:bg-[#edf7f6]'
                }`}
              >
                <img
                  src={st.avatarUrl || defaultAvatar}
                  alt={st.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#139a91]"
                  referrerPolicy="no-referrer"
                />
                <div className="truncate flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#082142] truncate">{st.name}</p>
                  <p className="text-[11px] text-[#139a91] font-medium">{st.classId}</p>
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-[#139a91] shrink-0"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Teacher Portal Promotion Banner */}
      <div className="bg-gradient-to-r from-[#082142] to-[#112f5a] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#139a91] text-white inline-block mb-1.5">
            Faculty Access
          </span>
          <h4 className="text-xl font-serif font-bold">Are you a Bina Bangsa Faculty Member?</h4>
          <p className="text-xs text-[#b2d9d4] mt-0.5 max-w-lg">
            Access the Teacher Admin Panel to schedule school events, set student-targeted assignments, and publish official bulletins.
          </p>
        </div>

        <button
          id="btn-profile-teacher-login"
          onClick={onOpenTeacherLogin}
          className="px-5 py-2.5 rounded-full bg-[#139a91] hover:bg-[#0e8b83] text-white font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isTeacherMode ? 'Open Admin Panel' : 'Teacher Login'}</span>
        </button>
      </div>
    </div>
  );
};
