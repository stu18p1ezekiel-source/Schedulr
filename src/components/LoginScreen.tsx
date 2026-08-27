import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff
} from 'lucide-react';
import { Student, Teacher } from '../types';
import { CLASS_DIVISIONS, TEACHERS } from '../mockData';

interface LoginScreenProps {
  onStudentLogin: (student: Student) => void;
  onTeacherLogin: (teacher: Teacher) => void;
  allStudents: Student[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onStudentLogin,
  onTeacherLogin,
  allStudents,
}) => {
  const [activePortal, setActivePortal] = useState<'student' | 'teacher'>('student');

  // Student Form State (NO PASSWORD NEEDED)
  const [selectedClass, setSelectedClass] = useState<string>('JC1-A');
  const [studentName, setStudentName] = useState<string>('Nicholas Tan');

  // Teacher Form State (PASSWORD REQUIRED)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(TEACHERS[0].id);
  const [teacherPassword, setTeacherPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>('');

  // Handle Student Login
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
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
        classId: selectedClass,
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
  };

  // Handle Teacher Login
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
  };

  return (
    <div id="bbs-login-screen" className="min-h-screen bg-[#edf7f6] flex items-center justify-center p-4 sm:p-6 text-[#082142] antialiased">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#cbe6e3] shadow-xl p-6 sm:p-8">
        
        {/* Title in Futura font */}
        <div className="text-center mb-6">
          <h1 
            id="login-title"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[#082142]"
            style={{ fontFamily: 'Futura, "Futura PT", "Century Gothic", "Trebuchet MS", sans-serif' }}
          >
            BBS Scheduler
          </h1>
        </div>

        {/* Simple Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#edf7f6] rounded-2xl border border-[#cbe6e3] gap-1.5 mb-6">
          <button
            id="btn-switch-student-portal"
            type="button"
            onClick={() => {
              setActivePortal('student');
              setPasswordError('');
            }}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activePortal === 'student'
                ? 'bg-[#139a91] text-white shadow-xs'
                : 'text-[#40535e] hover:bg-[#d8ecea]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Student</span>
          </button>

          <button
            id="btn-switch-teacher-portal"
            type="button"
            onClick={() => {
              setActivePortal('teacher');
              setPasswordError('');
            }}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activePortal === 'teacher'
                ? 'bg-[#082142] text-white shadow-xs'
                : 'text-[#40535e] hover:bg-[#d8ecea]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Teacher</span>
          </button>
        </div>

        {/* Student Login Form */}
        {activePortal === 'student' && (
          <form onSubmit={handleStudentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">
                Class / Grade
              </label>
              <select
                id="login-select-class"
                value={selectedClass}
                onChange={(e) => {
                  const newClass = e.target.value;
                  setSelectedClass(newClass);
                  const firstInClass = allStudents.find(s => s.classId === newClass);
                  if (firstInClass) setStudentName(firstInClass.name);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] font-semibold focus:outline-none focus:ring-2 focus:ring-[#139a91]"
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
                Name
              </label>
              <input
                id="login-input-student-name"
                type="text"
                required
                placeholder="Enter your name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
              />
            </div>

            <button
              id="btn-submit-student-entry"
              type="submit"
              className="w-full mt-2 py-3 rounded-xl bg-[#139a91] hover:bg-[#0e8b83] text-white font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Teacher Login Form */}
        {activePortal === 'teacher' && (
          <form onSubmit={handleTeacherSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">
                Faculty Member
              </label>
              <select
                id="login-select-teacher"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] font-semibold focus:outline-none focus:ring-2 focus:ring-[#139a91]"
              >
                {TEACHERS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#082142]">
                  Faculty Password
                </label>
              </div>

              <div className="relative">
                <input
                  id="login-input-teacher-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={teacherPassword}
                  onChange={(e) => {
                    setTeacherPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 ${
                    passwordError 
                      ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]' 
                      : 'border-[#cbe6e3] focus:ring-[#139a91]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#75777f] hover:text-[#082142] transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError && (
                <p className="text-xs text-[#ba1a1a] font-semibold mt-1">
                  {passwordError}
                </p>
              )}
            </div>

            <button
              id="btn-submit-teacher-entry"
              type="submit"
              className="w-full mt-2 py-3 rounded-xl bg-[#082142] hover:bg-[#112f5a] text-white font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
