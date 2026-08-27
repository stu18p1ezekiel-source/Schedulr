import React, { useState } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  AlertCircle, 
  Users, 
  Check, 
  Sparkles,
  Plus,
  Search
} from 'lucide-react';
import { HomeworkItem, Student, TargetAudience } from '../types';
import { CLASSES, CLASS_DIVISIONS } from '../mockData';

interface AddHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHomework: (homework: Omit<HomeworkItem, 'id' | 'completed'>) => void;
  currentStudent: Student | null;
  isTeacherMode: boolean;
  allStudents: Student[];
}

export const AddHomeworkModal: React.FC<AddHomeworkModalProps> = ({
  isOpen,
  onClose,
  onAddHomework,
  currentStudent,
  isTeacherMode,
  allStudents,
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [dueDate, setDueDate] = useState('2026-08-30');
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [description, setDescription] = useState('');
  
  // Targeting options for teacher mode
  const [targetAudience, setTargetAudience] = useState<TargetAudience>(
    isTeacherMode ? 'CLASS' : 'CLASS'
  );
  const [targetClass, setTargetClass] = useState<string>(currentStudent?.classId || 'Grade 11-A');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    currentStudent ? [currentStudent.id] : []
  );
  const [studentSearch, setStudentSearch] = useState('');

  if (!isOpen) return null;

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) => 
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please provide an assignment title.');
      return;
    }

    if (isTeacherMode && targetAudience === 'SPECIFIC_STUDENTS' && selectedStudentIds.length === 0) {
      alert('Please select at least one student.');
      return;
    }

    onAddHomework({
      title: title.trim(),
      subject,
      dueDate,
      dueTime: dueTime ? dueTime : undefined,
      priority,
      description: description.trim() || undefined,
      targetAudience: isTeacherMode ? targetAudience : 'CLASS',
      targetClass: isTeacherMode && targetAudience === 'CLASS' ? targetClass : currentStudent?.classId,
      targetStudentIds: isTeacherMode && targetAudience === 'SPECIFIC_STUDENTS' ? selectedStudentIds : undefined,
      studentId: currentStudent?.id,
      assignedBy: isTeacherMode ? 'Faculty Member' : 'Self-Assigned',
    });

    onClose();
  };

  const SUBJECTS = [
    'Physics',
    'Chemistry',
    'Biology',
    'Mathematics',
    'English Literature',
    'History',
    'Economics',
    'Computer Science',
    'Art & Design',
    'Mandarin',
  ];

  const filteredStudents = allStudents.filter((s) => 
    !studentSearch || 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.classId.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div 
      id="add-homework-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="add-homework-modal-content"
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#cbe6e3] animate-in zoom-in-95 duration-200 scrollbar-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#082142] text-white p-5 rounded-t-2xl flex items-center justify-between border-b border-[#112f5a]">
          <div>
            <h3 className="text-lg font-serif font-bold text-white">
              {isTeacherMode ? 'Set Academic Assignment' : 'Add Homework Task'}
            </h3>
            <p className="text-xs text-[#b2d9d4]">
              {isTeacherMode ? 'Distribute to class or individual students' : 'Track your BBS personal study obligations'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#b2d9d4] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Assignment Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">
              Assignment Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Physics Lab 3 Report, Math Problem Set #4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
            />
          </div>

          {/* Subject & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">
                Subject Course
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
              >
                {SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">
                Priority
              </label>
              <div className="flex rounded-xl overflow-hidden border border-[#cbe6e3] p-1 bg-[#f4f9f8] gap-1">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-lg transition-all cursor-pointer ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-[#ba1a1a] text-white shadow-xs'
                          : p === 'medium'
                          ? 'bg-[#139a91] text-white shadow-xs'
                          : 'bg-[#40535e] text-white shadow-xs'
                        : 'text-[#75777f] hover:text-[#082142]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
              />
            </div>
          </div>

          {/* Instructions / Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">
              Requirements & Notes
            </label>
            <textarea
              rows={3}
              placeholder="Include page numbers, lab rubric, or special submission guidelines..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
            />
          </div>

          {/* Teacher Targeting Controls */}
          {isTeacherMode && (
            <div className="p-4 rounded-xl bg-[#edf7f6] border border-[#cbe6e3] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#082142] uppercase tracking-wider block">
                  Who can see this assignment?
                </span>
                {targetAudience === 'SPECIFIC_STUDENTS' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#139a91] text-white">
                    {selectedStudentIds.length} student(s) selected
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setTargetAudience('ALL')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    targetAudience === 'ALL'
                      ? 'bg-[#139a91] text-white border-[#139a91]'
                      : 'bg-white text-[#40535e] border-[#cbe6e3]'
                  }`}
                >
                  Everyone
                </button>
                <button
                  type="button"
                  onClick={() => setTargetAudience('CLASS')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    targetAudience === 'CLASS'
                      ? 'bg-[#139a91] text-white border-[#139a91]'
                      : 'bg-white text-[#40535e] border-[#cbe6e3]'
                  }`}
                >
                  Entire Class
                </button>
                <button
                  type="button"
                  onClick={() => setTargetAudience('SPECIFIC_STUDENTS')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    targetAudience === 'SPECIFIC_STUDENTS'
                      ? 'bg-[#139a91] text-white border-[#139a91]'
                      : 'bg-white text-[#40535e] border-[#cbe6e3]'
                  }`}
                >
                  Specific Students
                </button>
              </div>

              {targetAudience === 'CLASS' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#75777f] mb-1">
                    Select Target Class:
                  </label>
                  <select
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#cbe6e3] text-xs bg-white text-[#082142] font-semibold"
                  >
                    {CLASS_DIVISIONS.map((div) => (
                      <optgroup key={div.code} label={div.division}>
                        {div.classes.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              )}

              {targetAudience === 'SPECIFIC_STUDENTS' && (
                <div className="space-y-2 pt-1">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#75777f] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search student by name..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#cbe6e3] text-xs bg-white text-[#082142]"
                    />
                  </div>

                  <div className="border border-[#cbe6e3] rounded-lg bg-white max-h-36 overflow-y-auto divide-y divide-[#edf7f6]">
                    {filteredStudents.map((st) => {
                      const isChecked = selectedStudentIds.includes(st.id);
                      return (
                        <label
                          key={st.id}
                          className="p-2 flex items-center justify-between gap-2 text-xs cursor-pointer hover:bg-[#edf7f6]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleStudent(st.id)}
                              className="accent-[#139a91] w-3.5 h-3.5 cursor-pointer"
                            />
                            <span className="font-semibold text-[#082142] truncate">{st.name}</span>
                            <span className="text-[10px] text-[#75777f]">({st.classId})</span>
                          </div>
                          {isChecked && (
                            <span className="text-[10px] font-bold text-[#139a91]">Selected</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-[#cbe6e3] text-[#40535e] hover:bg-[#edf7f6] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full bg-[#139a91] hover:bg-[#0e8b83] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Save Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
