import React, { useState } from 'react';
import { 
  X, 
  GraduationCap, 
  ShieldCheck, 
  User, 
  Lock, 
  ArrowRight, 
  Check, 
  Sparkles, 
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { Student, Teacher } from '../types';
import { CLASSES, CLASS_DIVISIONS, TEACHERS } from '../mockData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'student' | 'teacher';
  onStudentLogin: (student: Student) => void;
  onTeacherLogin: (teacher: Teacher) => void;
  allStudents: Student[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'student',
  onStudentLogin,
  onTeacherLogin,
  allStudents,
}) => {
  const [tab, setTab] = useState<'student' | 'teacher'>(initialMode);
  
  // Student Login State (NO PASSWORD)
  const [selectedClass, setSelectedClass] = useState<string>('JC1-A');
  const [studentName, setStudentName] = useState<string>('Nicholas Tan');
  
  // Teacher Login State (PASSWORD REQUIRED)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(TEACHERS[0].id);
  const [teacherPassword, setTeacherPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>('');

  if (!isOpen) return null;

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert('Please enter your full name.');
      return;
    }

    const existing = allStudents.find(
      s => s.name.toLowerCase() === studentName.trim().toLowerCase() && s.classId === selectedClass
    ) || allStudents.find(
      s => s.name.toLowerCase() === studentName.trim().toLowerCase()
    );

    if (existing) {
      onStudentLogin({
        ...existing,
        classId: selectedClass, // allow student to switch class if desired
      });
    } else {
      const newStudent: Student = {
        id: `s-${Date.now()}`,
        name: studentName.trim(),
        classId: selectedClass,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        email: `stu.${studentName.trim().toLowerCase().replace(/\s+/g, '.')}@binabangsaschool.com`,
        rollNumber: `${selectedClass.replace('-', '')}-${Math.floor(Math.random() * 80 + 10)}`,
      };
      onStudentLogin(newStudent);
    }

    onClose();
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherPassword.trim()) {
      setPasswordError('Invalid password');
      return;
    }

    const cleanPwd = teacherPassword.trim().toLowerCase();
    if (cleanPwd !== 'binabangsa' && cleanPwd !== 'teacher123' && cleanPwd !== 'admin123' && cleanPwd !== 'admin') {
      setPasswordError('Invalid password');
      return;
    }

    const teacher = TEACHERS.find(t => t.id === selectedTeacherId) || TEACHERS[0];
    setPasswordError('');
    onTeacherLogin(teacher);
    onClose();
  };

  const classStudents = allStudents.filter(s => s.classId === selectedClass);

  return (
    <div 
      id="login-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="login-modal-content"
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-[#cbe6e3] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#082142] text-white p-6 relative">
          <button
            id="btn-close-login-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <h3 className="text-xl font-serif font-bold">
              {tab === 'student' ? 'Student Portal Login' : 'Teacher Admin Portal'}
            </h3>
            <p className="text-xs text-[#b2d9d4]">
              {tab === 'student' ? 'BBS Scheduler • Student Sign In' : 'BBS Scheduler • Faculty Authorization'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mt-5 bg-white/10 p-1 rounded-xl">
            <button
              id="tab-btn-student"
              onClick={() => {
                setTab('student');
                setPasswordError('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'student'
                  ? 'bg-white text-[#082142] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </button>
            <button
              id="tab-btn-teacher"
              onClick={() => {
                setTab('teacher');
                setPasswordError('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'teacher'
                  ? 'bg-white text-[#082142] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Teacher Portal</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Student Login Form */}
        {tab === 'student' ? (
          <form onSubmit={handleStudentSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">
                Class / Grade (P1 - JC2) *
              </label>
              <select
                id="select-student-class"
                value={selectedClass}
                onChange={(e) => {
                  const newClass = e.target.value;
                  setSelectedClass(newClass);
                  const firstInClass = allStudents.find(s => s.classId === newClass);
                  if (firstInClass) setStudentName(firstInClass.name);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
              >
                {CLASS_DIVISIONS.map((div) => (
                  <optgroup key={div.code} label={div.division}>
                    {div.classes.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">
                Full Name *
              </label>
              <input
                id="input-student-name"
                type="text"
                required
                placeholder="e.g. Nicholas Tan"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
              />
            </div>

            {/* Quick Select from Class Roster */}
            {classStudents.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-[#75777f] block mb-1.5">
                  Quick select from {selectedClass} roster:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-[#edf7f6] rounded-xl border border-[#cbe6e3]">
                  {classStudents.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStudentName(st.name)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        studentName === st.name
                          ? 'bg-[#139a91] border-[#139a91] text-white font-bold'
                          : 'bg-white border-[#cbe6e3] text-[#40535e] hover:bg-[#d8ecea]'
                      }`}
                    >
                      {st.avatarUrl && (
                        <img src={st.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                      )}
                      <span>{st.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#edf7f6] p-3 rounded-xl border border-[#cbe6e3] text-xs text-[#40535e] flex items-center gap-2">
              <Check className="w-4 h-4 text-[#139a91] shrink-0" />
              <span>Your BBS student schedule and assignments will load automatically.</span>
            </div>

            <div className="pt-2">
              <button
                id="btn-submit-student-login"
                type="submit"
                className="w-full py-3 rounded-full bg-[#139a91] hover:bg-[#0e8b83] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: Teacher Admin Login Form */
          <form onSubmit={handleTeacherSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">
                Faculty Member *
              </label>
              <select
                id="select-teacher-profile"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
              >
                {TEACHERS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.role.split('&')[0]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#082142]">
                  Faculty Password *
                </label>
              </div>
              <div className="relative">
                <input
                  id="input-teacher-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={teacherPassword}
                  onChange={(e) => {
                    setTeacherPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 ${
                    passwordError ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]' : 'border-[#cbe6e3] focus:ring-[#139a91]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#75777f] hover:text-[#082142] transition-colors cursor-pointer"
                  title={showPassword ? 'Hide passkey' : 'Show passkey'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-[#ba1a1a] mt-1 font-semibold">{passwordError}</p>
              )}
            </div>

            <div className="bg-[#edf7f6] p-3 rounded-xl border border-[#cbe6e3] text-xs text-[#082142]">
              <div className="flex items-center gap-1.5 font-bold mb-0.5">
                <KeyRound className="w-3.5 h-3.5 text-[#139a91]" />
                <span>Authorized Teacher Capabilities:</span>
              </div>
              <p className="text-[11px] text-[#40535e]">
                Create events with title & picture upload, target whole school (P1-JC2), specific classes (A/B), custom groups, or single students.
              </p>
            </div>

            <div className="pt-2">
              <button
                id="btn-submit-teacher-login"
                type="submit"
                className="w-full py-3 rounded-full bg-[#082142] hover:bg-[#112f5a] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Teacher Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

