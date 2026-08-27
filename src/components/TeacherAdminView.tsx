import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  CalendarPlus, 
  MessageSquare, 
  CheckSquare, 
  Users, 
  Upload, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  Layers, 
  Image as ImageIcon,
  Search,
  Check,
  X,
  UserCheck,
  Filter,
  GraduationCap,
  ChevronRight,
  Send,
  User,
  Radio,
  FileImage,
  LogOut,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ZoomIn,
  FileCheck,
  Maximize2,
  FileText,
  HelpCircle
} from 'lucide-react';
import { EventItem, HomeworkItem, TeacherPost, Student, Teacher, TargetAudience, SubmissionStatus } from '../types';
import { CLASSES, CLASS_DIVISIONS, TEACHERS } from '../mockData';
import { AIDetailsWriter } from './AIDetailsWriter';

interface TeacherAdminViewProps {
  currentTeacher: Teacher;
  events: EventItem[];
  homeworkList: HomeworkItem[];
  posts: TeacherPost[];
  students: Student[];
  onAddEvent: (event: Omit<EventItem, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  onAddHomework: (homework: Omit<HomeworkItem, 'id' | 'completed'>) => void;
  onDeleteHomework: (id: string) => void;
  onAddPost: (post: Omit<TeacherPost, 'id' | 'likesCount' | 'likedByCurrentUser'>) => void;
  onDeletePost: (id: string) => void;
  onReviewSubmission?: (homeworkId: string, status: 'approved' | 'declined', feedback?: string, studentId?: string) => void;
  onExitTeacherMode: () => void;
  onLogout?: () => void;
}

export const TeacherAdminView: React.FC<TeacherAdminViewProps> = ({
  currentTeacher,
  events,
  homeworkList,
  posts,
  students,
  onAddEvent,
  onDeleteEvent,
  onAddHomework,
  onDeleteHomework,
  onAddPost,
  onDeletePost,
  onReviewSubmission,
  onExitTeacherMode,
  onLogout,
}) => {
  const [adminTab, setAdminTab] = useState<'events' | 'homework' | 'posts' | 'students'>('events');

  // Homework Review Sub-tabs: 'reviews' | 'publish' | 'assignments'
  const [hwSubTab, setHwSubTab] = useState<'reviews' | 'publish' | 'assignments'>('reviews');
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('pending');
  const [submissionSearch, setSubmissionSearch] = useState('');
  
  // Lightbox Modal for Full-Resolution Photo Proof Inspection
  const [lightboxProof, setLightboxProof] = useState<{
    homeworkId: string;
    studentId?: string;
    imageUrl: string;
    studentName?: string;
    studentClass?: string;
    homeworkTitle: string;
    subject: string;
    notes?: string;
    status: SubmissionStatus;
    feedback?: string;
  } | null>(null);

  // Decline Feedback Modal/State
  const [decliningItem, setDecliningItem] = useState<HomeworkItem | null>(null);
  const [declineFeedbackText, setDeclineFeedbackText] = useState('');

  // Delete Warning Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'homework' | 'event' | 'post';
    id: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  // Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('2026-08-30');
  const [eventStartTime, setEventStartTime] = useState('09:00 AM');
  const [eventEndTime, setEventEndTime] = useState('11:30 AM');
  const [eventDetails, setEventDetails] = useState('');
  const [eventLocation, setEventLocation] = useState('BBS Auditorium');
  const [eventCategory, setEventCategory] = useState<'academic' | 'sports' | 'arts' | 'deadline' | 'workshop' | 'general'>('academic');
  
  // Event Targeting State: ALL | CLASS | GROUP_STUDENTS | SINGLE_STUDENT
  const [eventAudience, setEventAudience] = useState<TargetAudience>('ALL');
  const [eventTargetClass, setEventTargetClass] = useState<string>('JC1-A');
  const [eventSelectedStudentIds, setEventSelectedStudentIds] = useState<string[]>([]);
  const [eventSingleStudentId, setEventSingleStudentId] = useState<string>('');
  
  // Image Upload State
  const [eventImageUrl, setEventImageUrl] = useState('');
  const [imageUploadPreview, setImageUploadPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Student Picker Search inside Event Form
  const [groupSearchQuery, setGroupSearchQuery] = useState('');

  // Student Directory Tab Search State
  const [directorySearchQuery, setDirectorySearchQuery] = useState('');
  const [directoryClassFilter, setDirectoryClassFilter] = useState('ALL');
  const [directoryDivisionFilter, setDirectoryDivisionFilter] = useState('ALL');

  // New Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postMessage, setPostMessage] = useState('');
  const [postCategory, setPostCategory] = useState<'announcement' | 'reminder' | 'event' | 'deadline'>('announcement');
  const [postAudience, setPostAudience] = useState<TargetAudience>('ALL');
  const [postTargetClass, setPostTargetClass] = useState<string>('JC1-A');
  const [postImageUrl, setPostImageUrl] = useState('');

  // New Homework Form State
  const [hwTitle, setHwTitle] = useState('');
  const [hwSubject, setHwSubject] = useState('Mathematics');
  const [hwDueDate, setHwDueDate] = useState('2026-08-31');
  const [hwTargetClass, setHwTargetClass] = useState('JC1-A');
  const [hwDescription, setHwDescription] = useState('');

  // Inline Confirmation Banner State
  const [placedConfirmation, setPlacedConfirmation] = useState<{
    type: 'event' | 'post' | 'homework';
    title: string;
    message: string;
    target?: string;
  } | null>(null);

  const sampleImages = [
    { label: 'STEM / Science Lab', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80' },
    { label: 'Math Olympiad', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80' },
    { label: 'Physics / Waves', url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop&q=80' },
    { label: 'Digital Library', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuEWQqOv3l1tWdFP92TXdflfYx_mrC2fT2rL-iUwm52DHymyLxgCByNEKK5O4_kl8MRC8W9DR3VBy97u1cbvfzawjr-s4hPaMgxAoH5mcd6Yaeya6AckCOm9S5PIjwoJggzK8HgET9A2yYQxXzGmGUCF5lq7Mxf_fyzp6_7cJR8fXTp5EeIG3XAwBYTjf2WLssyu4vUBww219O_V3HOErmSSBbT9vDZNl6bmN4MsG-m2A1xUNIHA_U' },
    { label: 'Sports Gala', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80' },
    { label: 'Campus Courtyard', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80' },
  ];

  // Handle local file upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Please choose an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageUploadPreview(base64);
        setEventImageUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageUploadPreview(null);
    setEventImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Students in currently selected target class
  const classRosterStudents = students.filter(s => s.classId === eventTargetClass);

  // Filtered students for group selection in selected class
  const filteredGroupStudents = classRosterStudents.filter(s => {
    if (!groupSearchQuery.trim()) return true;
    const q = groupSearchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) ||
      s.rollNumber?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q);
  });

  const toggleGroupStudentSelection = (studentId: string) => {
    setEventSelectedStudentIds((prev) => 
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllClassStudentsInGroup = () => {
    const ids = classRosterStudents.map(s => s.id);
    setEventSelectedStudentIds(ids);
  };

  const clearGroupSelection = () => {
    setEventSelectedStudentIds([]);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDetails.trim()) {
      alert('Please provide event title and details.');
      return;
    }

    let finalAudience: TargetAudience = eventAudience;
    let targetClass: string | undefined = undefined;
    let targetStudentIds: string[] | undefined = undefined;

    if (eventAudience === 'CLASS') {
      targetClass = eventTargetClass;
    } else if (eventAudience === 'GROUP_STUDENTS') {
      if (eventSelectedStudentIds.length === 0) {
        alert(`Please select at least one student from ${eventTargetClass} for this group event.`);
        return;
      }
      targetClass = eventTargetClass;
      targetStudentIds = eventSelectedStudentIds;
    } else if (eventAudience === 'SINGLE_STUDENT') {
      if (!eventSingleStudentId) {
        alert(`Please select a single student from ${eventTargetClass}.`);
        return;
      }
      targetClass = eventTargetClass;
      targetStudentIds = [eventSingleStudentId];
    }

    onAddEvent({
      title: eventTitle.trim(),
      date: eventDate,
      startTime: eventStartTime,
      endTime: eventEndTime,
      details: eventDetails.trim(),
      location: eventLocation,
      category: eventCategory,
      counselors: [currentTeacher.name],
      targetAudience: finalAudience,
      targetClass,
      targetStudentIds,
      imageUrl: eventImageUrl.trim() || undefined,
    });

    let targetSummary = 'School-wide (All Classes)';
    if (eventAudience === 'CLASS') targetSummary = `Class ${eventTargetClass}`;
    if (eventAudience === 'GROUP_STUDENTS') targetSummary = `${eventSelectedStudentIds.length} student(s) in ${eventTargetClass}`;
    if (eventAudience === 'SINGLE_STUDENT') {
      const st = students.find(s => s.id === eventSingleStudentId);
      targetSummary = `${st?.name || 'Single Student'} (${eventTargetClass})`;
    }

    setPlacedConfirmation({
      type: 'event',
      title: 'Event has been placed',
      message: `"${eventTitle.trim()}" is now scheduled on the BBS Calendar and posted to the student bulletin feed.`,
      target: targetSummary,
    });

    // Reset Form
    setEventTitle('');
    setEventDetails('');
    clearImage();
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postMessage.trim()) {
      alert('Please fill in bulletin title and message.');
      return;
    }

    const targetSummary = postAudience === 'CLASS' ? `Class ${postTargetClass}` : 'All Classes';

    onAddPost({
      teacherName: currentTeacher.name,
      teacherRole: currentTeacher.role,
      teacherAvatar: currentTeacher.avatarUrl,
      title: postTitle.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      fullMessage: postMessage.trim(),
      category: postCategory,
      targetClass: postAudience === 'CLASS' ? postTargetClass : 'ALL',
      imageUrl: postImageUrl.trim() || undefined,
    });

    setPlacedConfirmation({
      type: 'post',
      title: 'Post has been placed',
      message: `"${postTitle.trim()}" has been published to the student bulletin feed.`,
      target: targetSummary,
    });

    setPostTitle('');
    setPostMessage('');
    setPostImageUrl('');
  };

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle.trim() || !hwDueDate.trim()) {
      alert('Please provide assignment title and due date.');
      return;
    }

    onAddHomework({
      title: hwTitle.trim(),
      subject: hwSubject,
      dueDate: hwDueDate,
      targetClass: hwTargetClass,
      targetAudience: hwTargetClass === 'ALL' ? 'ALL' : 'CLASS',
      priority: 'medium',
      description: hwDescription.trim() || undefined,
    });

    setPlacedConfirmation({
      type: 'homework',
      title: 'Assignment has been placed',
      message: `"${hwTitle.trim()}" (${hwSubject}) assigned to Class ${hwTargetClass}.`,
      target: `Due ${hwDueDate}`,
    });

    setHwTitle('');
    setHwDescription('');
    setHwDueDate('');
  };

  // Direct shortcuts from directory
  const handleScheduleForSingleStudent = (student: Student) => {
    setEventAudience('SINGLE_STUDENT');
    setEventTargetClass(student.classId);
    setEventSingleStudentId(student.id);
    setAdminTab('events');
  };

  const handleScheduleForClass = (classId: string) => {
    setEventAudience('CLASS');
    setEventTargetClass(classId);
    setAdminTab('events');
  };

  return (
    <div id="teacher-admin-view" className="space-y-6 max-w-6xl mx-auto">
      {/* Faculty Banner */}
      <div className="bg-[#082142] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#112f5a]">
        <div className="flex items-center gap-4 relative z-10">
          <img
            src={currentTeacher.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
            alt={currentTeacher.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#139a91] shrink-0 shadow-md"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#139a91] text-white">
                Faculty Portal
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-[#b2d9d4]">
                P1 - JC2 Classes
              </span>
            </div>
            <h3 className="text-2xl font-serif font-bold mt-1 text-white">{currentTeacher.name}</h3>
            <p className="text-xs text-[#b2d9d4]">{currentTeacher.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 w-full sm:w-auto flex-wrap">
          <button
            id="btn-teacher-switch-student"
            onClick={onExitTeacherMode}
            className="px-4 py-2 rounded-full border border-white/30 text-white hover:bg-white/10 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>Switch to Student View</span>
          </button>

          {onLogout && (
            <button
              id="btn-teacher-logout"
              onClick={onLogout}
              className="px-4 py-2 rounded-full bg-[#ba1a1a]/80 hover:bg-[#ba1a1a] text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-[#cbe6e3] shadow-xs overflow-x-auto gap-2">
        <button
          onClick={() => setAdminTab('events')}
          className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminTab === 'events'
              ? 'bg-[#139a91] text-white shadow-xs'
              : 'text-[#40535e] hover:bg-[#edf7f6]'
          }`}
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Publish Events ({events.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('students')}
          className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminTab === 'students'
              ? 'bg-[#139a91] text-white shadow-xs'
              : 'text-[#40535e] hover:bg-[#edf7f6]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Class Rosters P1-JC2 ({students.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('posts')}
          className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminTab === 'posts'
              ? 'bg-[#139a91] text-white shadow-xs'
              : 'text-[#40535e] hover:bg-[#edf7f6]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Faculty Bulletins ({posts.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('homework')}
          className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
            adminTab === 'homework'
              ? 'bg-[#139a91] text-white shadow-xs'
              : 'text-[#40535e] hover:bg-[#edf7f6]'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Assignments & Proofs ({homeworkList.length})</span>
          {homeworkList.filter(h => h.submissionStatus === 'pending_approval').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 animate-pulse">
              {homeworkList.filter(h => h.submissionStatus === 'pending_approval').length} Pending
            </span>
          )}
        </button>
      </div>

      {/* Prominent Checkmark Notification Banner */}
      {placedConfirmation && (
        <div 
          id="placed-confirmation-banner"
          className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 sm:p-5 shadow-md flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300 relative overflow-hidden"
        >
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* Emerald Checkmark Badge */}
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30 border-2 border-emerald-300">
              <Check className="w-7 h-7 stroke-[3.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  ✓ {placedConfirmation.title}
                </span>
                {placedConfirmation.target && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900">
                    {placedConfirmation.target}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-emerald-950 mt-1">
                {placedConfirmation.message}
              </p>
            </div>
          </div>

          <button
            onClick={() => setPlacedConfirmation(null)}
            className="p-1.5 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-200/60 rounded-xl transition-colors shrink-0"
            title="Dismiss confirmation"
            aria-label="Dismiss confirmation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Tab 1: Event Publisher with 4 Targeting Modes & Picture Upload */}
      {adminTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Creation Form */}
          <form onSubmit={handleCreateEvent} className="lg:col-span-2 bg-white rounded-2xl border border-[#cbe6e3] p-6 sm:p-7 shadow-xs space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-serif font-bold text-[#082142]">Schedule Event & Target Audience</h4>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#d2f2ef] text-[#074e48]">
                  P1-P6 • S1-S4 • JC1-JC2
                </span>
              </div>
              <p className="text-xs text-[#40535e] mt-0.5">
                Set event title, upload pictures, and broadcast to all classes, a specific class, a group, or a single student.
              </p>
            </div>

            {/* 1. Event Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">
                Event Title *
              </label>
              <input
                id="input-event-title"
                type="text"
                required
                placeholder="e.g. Cambridge Science Fair, Physics Lab Practical, Math Olympiad Prep"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
              />
            </div>

            {/* 2. Target Audience Picker (All classes, Specific Class, Group, Single Student) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#edf7f6] border border-[#cbe6e3] space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#082142]">
                  Target Audience Selection *
                </label>
                <p className="text-[11px] text-[#40535e]">
                  Pick who can view and attend this event on BBS Scheduler.
                </p>
              </div>

              {/* 4 Audience Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. All Classes */}
                <label
                  onClick={() => setEventAudience('ALL')}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    eventAudience === 'ALL'
                      ? 'bg-white border-[#139a91] ring-2 ring-[#139a91] shadow-xs'
                      : 'bg-white/70 border-[#cbe6e3] hover:bg-white text-[#40535e]'
                  }`}
                >
                  <input
                    type="radio"
                    name="event-audience"
                    checked={eventAudience === 'ALL'}
                    onChange={() => setEventAudience('ALL')}
                    className="accent-[#139a91] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#082142]">All Classes</p>
                    <p className="text-[10px] text-[#75777f]">Whole school (P1 to JC2)</p>
                  </div>
                </label>

                {/* 2. Specific Class */}
                <label
                  onClick={() => setEventAudience('CLASS')}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    eventAudience === 'CLASS'
                      ? 'bg-white border-[#139a91] ring-2 ring-[#139a91] shadow-xs'
                      : 'bg-white/70 border-[#cbe6e3] hover:bg-white text-[#40535e]'
                  }`}
                >
                  <input
                    type="radio"
                    name="event-audience"
                    checked={eventAudience === 'CLASS'}
                    onChange={() => setEventAudience('CLASS')}
                    className="accent-[#139a91] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#082142]">A Specific Class</p>
                    <p className="text-[10px] text-[#75777f]">Entire class roster (e.g. JC1-A)</p>
                  </div>
                </label>

                {/* 3. Group of Students from Specific Class */}
                <label
                  onClick={() => setEventAudience('GROUP_STUDENTS')}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    eventAudience === 'GROUP_STUDENTS'
                      ? 'bg-white border-[#139a91] ring-2 ring-[#139a91] shadow-xs'
                      : 'bg-white/70 border-[#cbe6e3] hover:bg-white text-[#40535e]'
                  }`}
                >
                  <input
                    type="radio"
                    name="event-audience"
                    checked={eventAudience === 'GROUP_STUDENTS'}
                    onChange={() => setEventAudience('GROUP_STUDENTS')}
                    className="accent-[#139a91] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#082142]">A Group of Students</p>
                    <p className="text-[10px] text-[#75777f]">Multiple students from a class</p>
                  </div>
                </label>

                {/* 4. Single Student from Specific Class */}
                <label
                  onClick={() => setEventAudience('SINGLE_STUDENT')}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    eventAudience === 'SINGLE_STUDENT'
                      ? 'bg-white border-[#139a91] ring-2 ring-[#139a91] shadow-xs'
                      : 'bg-white/70 border-[#cbe6e3] hover:bg-white text-[#40535e]'
                  }`}
                >
                  <input
                    type="radio"
                    name="event-audience"
                    checked={eventAudience === 'SINGLE_STUDENT'}
                    onChange={() => setEventAudience('SINGLE_STUDENT')}
                    className="accent-[#139a91] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#082142]">A Single Student</p>
                    <p className="text-[10px] text-[#75777f]">Individual student from a class</p>
                  </div>
                </label>
              </div>

              {/* Class Selection Dropdown (Shown if Specific Class, Group, or Single Student is selected) */}
              {eventAudience !== 'ALL' && (
                <div className="pt-2 border-t border-[#cbe6e3] space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#082142] mb-1">
                      Choose Class (P1 - P6, S1 - S4, JC1 - JC2):
                    </label>
                    <select
                      value={eventTargetClass}
                      onChange={(e) => {
                        setEventTargetClass(e.target.value);
                        setEventSelectedStudentIds([]);
                        setEventSingleStudentId('');
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm bg-white text-[#082142] font-semibold focus:outline-none focus:ring-2 focus:ring-[#139a91]"
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

                  {/* Option 3 Sub-View: Group of Students Checkbox Selector */}
                  {eventAudience === 'GROUP_STUDENTS' && (
                    <div className="space-y-3 bg-white p-3.5 rounded-xl border border-[#cbe6e3]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#082142]">
                          Select Group Members in {eventTargetClass} ({eventSelectedStudentIds.length} selected):
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={selectAllClassStudentsInGroup}
                            className="text-[11px] font-bold text-[#139a91] hover:underline"
                          >
                            Select All in {eventTargetClass}
                          </button>
                          <span className="text-[#cbe6e3]">•</span>
                          <button
                            type="button"
                            onClick={clearGroupSelection}
                            className="text-[11px] font-bold text-[#ba1a1a] hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Search in Class */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#75777f] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder={`Search ${eventTargetClass} students...`}
                          value={groupSearchQuery}
                          onChange={(e) => setGroupSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#cbe6e3] text-xs bg-[#f4f9f8] text-[#082142] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
                        />
                      </div>

                      {/* Students Checkbox List */}
                      <div className="max-h-48 overflow-y-auto divide-y divide-[#edf7f6] border border-[#cbe6e3] rounded-lg">
                        {filteredGroupStudents.length === 0 ? (
                          <div className="p-3 text-center text-xs text-[#75777f]">
                            No students found in {eventTargetClass}.
                          </div>
                        ) : (
                          filteredGroupStudents.map((st) => {
                            const isChecked = eventSelectedStudentIds.includes(st.id);
                            return (
                              <label
                                key={st.id}
                                className={`p-2 flex items-center justify-between gap-2 cursor-pointer hover:bg-[#edf7f6] transition-colors ${
                                  isChecked ? 'bg-[#d2f2ef]/40' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleGroupStudentSelection(st.id)}
                                    className="accent-[#139a91] w-4 h-4 rounded cursor-pointer shrink-0"
                                  />
                                  <img
                                    src={st.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                    alt={st.name}
                                    className="w-7 h-7 rounded-full object-cover border border-[#139a91] shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-[#082142] truncate">{st.name}</p>
                                    <p className="text-[10px] text-[#75777f]">Roll: {st.rollNumber || st.id}</p>
                                  </div>
                                </div>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isChecked ? 'bg-[#139a91] text-white' : 'bg-[#edf7f6] text-[#75777f]'
                                  }`}
                                >
                                  {isChecked ? 'In Group' : 'Exclude'}
                                </span>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* Option 4 Sub-View: Single Student Radio Selector */}
                  {eventAudience === 'SINGLE_STUDENT' && (
                    <div className="space-y-3 bg-white p-3.5 rounded-xl border border-[#cbe6e3]">
                      <span className="text-xs font-bold text-[#082142] block">
                        Pick Single Student in {eventTargetClass}:
                      </span>

                      <div className="max-h-48 overflow-y-auto divide-y divide-[#edf7f6] border border-[#cbe6e3] rounded-lg">
                        {classRosterStudents.length === 0 ? (
                          <div className="p-3 text-center text-xs text-[#75777f]">
                            No students currently registered in {eventTargetClass}.
                          </div>
                        ) : (
                          classRosterStudents.map((st) => {
                            const isSelected = eventSingleStudentId === st.id;
                            return (
                              <label
                                key={st.id}
                                className={`p-2.5 flex items-center justify-between gap-2 cursor-pointer hover:bg-[#edf7f6] transition-colors ${
                                  isSelected ? 'bg-[#d2f2ef]/50 font-bold' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <input
                                    type="radio"
                                    name="single-student-choice"
                                    checked={isSelected}
                                    onChange={() => setEventSingleStudentId(st.id)}
                                    className="accent-[#139a91] w-4 h-4 cursor-pointer shrink-0"
                                  />
                                  <img
                                    src={st.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                    alt={st.name}
                                    className="w-7 h-7 rounded-full object-cover border border-[#139a91] shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs text-[#082142] truncate">{st.name}</p>
                                    <p className="text-[10px] text-[#75777f]">{st.email} • ID: {st.rollNumber}</p>
                                  </div>
                                </div>
                                {isSelected && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#139a91] text-white">
                                    Targeted
                                  </span>
                                )}
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Picture Upload for Event */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#082142]">
                Upload Event Picture / Poster
              </label>

              {/* Upload Drop Zone / Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#cbe6e3] hover:border-[#139a91] bg-[#f4f9f8] hover:bg-[#edf7f6] rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-6 h-6 text-[#139a91] mb-1.5" />
                  <p className="text-xs font-bold text-[#082142]">Click to Upload Picture</p>
                  <p className="text-[10px] text-[#75777f]">PNG, JPG, WebP up to 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </div>

                {/* Picture Preview or URL Input */}
                {imageUploadPreview || eventImageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#cbe6e3] bg-[#082142] h-28 flex items-center justify-center">
                    <img 
                      src={imageUploadPreview || eventImageUrl} 
                      alt="Event Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={clearImage}
                        className="px-3 py-1.5 rounded-full bg-[#ba1a1a] text-white text-xs font-bold shadow-md flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Picture</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-[#edf7f6] rounded-xl border border-[#cbe6e3] flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-[#082142] mb-1">Or enter image URL:</span>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={eventImageUrl}
                      onChange={(e) => {
                        setEventImageUrl(e.target.value);
                        setImageUploadPreview(null);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#cbe6e3] text-xs bg-white text-[#082142] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
                    />
                  </div>
                )}
              </div>

              {/* Presets Gallery */}
              <div>
                <span className="text-[11px] font-semibold text-[#75777f] block mb-1">
                  Or select from BBS Photo Library:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleImages.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => {
                        setEventImageUrl(img.url);
                        setImageUploadPreview(img.url);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        eventImageUrl === img.url
                          ? 'bg-[#139a91] text-white border-[#139a91] font-bold'
                          : 'bg-[#edf7f6] text-[#40535e] border-[#cbe6e3] hover:bg-[#d8ecea]'
                      }`}
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Date, Times, Category, Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">
                  Start Time
                </label>
                <input
                  type="text"
                  placeholder="09:00 AM"
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">
                  End Time
                </label>
                <input
                  type="text"
                  placeholder="12:30 PM"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">
                  Category
                </label>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
                >
                  <option value="academic">Academic & Competitions</option>
                  <option value="workshop">Workshop & Clinics</option>
                  <option value="deadline">Submission Deadline</option>
                  <option value="sports">Sports Gala</option>
                  <option value="arts">Arts & Music</option>
                  <option value="general">General Campus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">
                  Venue Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. BBS Auditorium, Science Wing Lab 3"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
                />
              </div>
            </div>

            {/* 5. Description / Instructions */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#082142]">
                  Full Description & Student Guidelines *
                </label>
              </div>

              {/* AI Details Writing Assistant */}
              <AIDetailsWriter
                title={eventTitle}
                category={eventCategory}
                targetAudience={eventAudience === 'ALL' ? 'Whole School (P1 to JC2)' : `Class ${eventTargetClass}`}
                currentText={eventDetails}
                contextType="event"
                onApplyText={(text) => setEventDetails(text)}
              />

              <textarea
                id="input-event-details"
                rows={4}
                required
                placeholder="Provide detailed instructions, tournament preparation, or classroom guidelines..."
                value={eventDetails}
                onChange={(e) => setEventDetails(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91] font-sans leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              id="btn-publish-event-submit"
              type="submit"
              className="w-full py-3 rounded-full bg-[#139a91] hover:bg-[#0e8b83] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>
                {eventAudience === 'ALL' && 'Publish Event to All Classes (P1 - JC2)'}
                {eventAudience === 'CLASS' && `Publish Event for Class ${eventTargetClass}`}
                {eventAudience === 'GROUP_STUDENTS' && `Publish Event for ${eventSelectedStudentIds.length} Student(s) in ${eventTargetClass}`}
                {eventAudience === 'SINGLE_STUDENT' && `Publish Event for Single Student in ${eventTargetClass}`}
              </span>
            </button>
          </form>

          {/* Active Events List & Audience Inspector */}
          <div className="bg-white rounded-2xl border border-[#cbe6e3] p-6 shadow-xs space-y-4">
            <div>
              <h4 className="text-lg font-serif font-bold text-[#082142]">Active BBS Events</h4>
              <p className="text-xs text-[#40535e]">Live calendar schedule & target audience badges.</p>
            </div>

            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {events.map((ev) => {
                const targetStudentNames = ev.targetStudentIds
                  ? ev.targetStudentIds
                      .map((id) => students.find((s) => s.id === id)?.name)
                      .filter(Boolean)
                      .join(', ')
                  : '';

                return (
                  <div 
                    key={ev.id} 
                    className="p-3.5 rounded-xl border border-[#cbe6e3] bg-[#f4f9f8] space-y-2 hover:border-[#139a91] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#d2f2ef] text-[#074e48]">
                            {ev.category}
                          </span>
                          
                          {/* Audience Badge */}
                          {ev.targetAudience === 'ALL' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#082142] text-white">
                              All Classes
                            </span>
                          )}
                          {ev.targetAudience === 'CLASS' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e6f3f1] text-[#082142] border border-[#cbe6e3]">
                              Class {ev.targetClass}
                            </span>
                          )}
                          {ev.targetAudience === 'GROUP_STUDENTS' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] border border-[#ffdad6]">
                              Group: {ev.targetStudentIds?.length || 0} in {ev.targetClass}
                            </span>
                          )}
                          {ev.targetAudience === 'SINGLE_STUDENT' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ede7f6] text-[#4a148c] border border-[#d1c4e9]">
                              Single Student ({ev.targetClass})
                            </span>
                          )}
                          {ev.targetAudience === 'SPECIFIC_STUDENTS' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] border border-[#ffdad6]">
                              {ev.targetStudentIds?.length || 0} Targeted Student(s)
                            </span>
                          )}
                        </div>

                        <h5 className="text-sm font-bold text-[#082142] mt-1.5 truncate">{ev.title}</h5>
                        <p className="text-xs text-[#75777f]">{ev.date} • {ev.startTime || 'All Day'}</p>
                      </div>

                      <button
                        id={`btn-delete-event-${ev.id}`}
                        onClick={() => {
                          setDeleteConfirm({
                            type: 'event',
                            id: ev.id,
                            title: ev.title,
                            subtitle: `${ev.date} • ${ev.startTime || 'All Day'} (${ev.targetAudience === 'ALL' ? 'All Classes' : ev.targetClass || 'Targeted'})`,
                          });
                        }}
                        className="p-1.5 text-[#75777f] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Image Preview Thumbnail if attached */}
                    {ev.imageUrl && (
                      <div className="h-16 w-full rounded-lg overflow-hidden border border-[#cbe6e3]">
                        <img 
                          src={ev.imageUrl} 
                          alt="" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {/* Show selected students list if targeted */}
                    {(ev.targetAudience === 'GROUP_STUDENTS' || ev.targetAudience === 'SINGLE_STUDENT' || ev.targetAudience === 'SPECIFIC_STUDENTS') && targetStudentNames && (
                      <div className="p-2 rounded-lg bg-white border border-[#cbe6e3] text-[11px] text-[#40535e]">
                        <span className="font-bold text-[#082142]">Targeted: </span>
                        <span>{targetStudentNames}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Student Directory & Grouping by Class (P1 to P6, S1 to S4, JC1 to JC2) */}
      {adminTab === 'students' && (
        <div className="bg-white rounded-2xl border border-[#cbe6e3] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xl font-serif font-bold text-[#082142]">Bina Bangsa School Roster (P1 - JC2)</h4>
              <p className="text-xs text-[#40535e]">
                Classes from Primary 1 to 6, Secondary 1 to 4, and Junior College 1 to 2 (Sections A & B).
              </p>
            </div>

            {/* Directory Filter & Search */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 text-[#75777f] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student by name..."
                  value={directorySearchQuery}
                  onChange={(e) => setDirectorySearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-xl border border-[#cbe6e3] text-xs bg-[#f4f9f8] text-[#082142] focus:outline-none focus:ring-2 focus:ring-[#139a91] w-48 sm:w-56"
                />
              </div>

              {/* Division Filter */}
              <select
                value={directoryDivisionFilter}
                onChange={(e) => {
                  setDirectoryDivisionFilter(e.target.value);
                  setDirectoryClassFilter('ALL');
                }}
                className="px-3 py-2 rounded-xl border border-[#cbe6e3] text-xs bg-[#f4f9f8] text-[#082142] font-semibold focus:outline-none focus:ring-2 focus:ring-[#139a91]"
              >
                <option value="ALL">All Divisions</option>
                <option value="primary">Primary (P1-P6)</option>
                <option value="secondary">Secondary (S1-S4)</option>
                <option value="jc">Junior College (JC1-JC2)</option>
              </select>

              {/* Specific Class Filter */}
              <select
                value={directoryClassFilter}
                onChange={(e) => setDirectoryClassFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#cbe6e3] text-xs bg-[#f4f9f8] text-[#082142] font-semibold focus:outline-none focus:ring-2 focus:ring-[#139a91]"
              >
                <option value="ALL">All Classes (24 Classes)</option>
                {CLASS_DIVISIONS.map((div) => (
                  <optgroup key={div.code} label={div.division}>
                    {div.classes.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Grouped by Class Display */}
          <div className="space-y-6">
            {CLASS_DIVISIONS.filter(div => directoryDivisionFilter === 'ALL' || div.code === directoryDivisionFilter).map((divisionGroup) => (
              <div key={divisionGroup.code} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#cbe6e3] pb-2">
                  <GraduationCap className="w-5 h-5 text-[#139a91]" />
                  <h5 className="font-serif font-bold text-[#082142] text-lg">
                    {divisionGroup.division}
                  </h5>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {divisionGroup.classes
                    .filter((c) => directoryClassFilter === 'ALL' || directoryClassFilter === c)
                    .map((classId) => {
                      const classStudents = students.filter((s) => {
                        const inClass = s.classId === classId;
                        const matchesSearch = !directorySearchQuery.trim() ||
                          s.name.toLowerCase().includes(directorySearchQuery.toLowerCase()) ||
                          s.email?.toLowerCase().includes(directorySearchQuery.toLowerCase()) ||
                          s.rollNumber?.toLowerCase().includes(directorySearchQuery.toLowerCase());
                        return inClass && matchesSearch;
                      });

                      if (classStudents.length === 0 && directorySearchQuery) return null;

                      return (
                        <div key={classId} className="border border-[#cbe6e3] rounded-2xl overflow-hidden shadow-2xs bg-white">
                          {/* Class Header */}
                          <div className="bg-[#edf7f6] px-4 py-2.5 border-b border-[#cbe6e3] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#082142] text-sm">
                                Class {classId}
                              </span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#082142] border border-[#cbe6e3]">
                                {classStudents.length} Students
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleScheduleForClass(classId)}
                              className="text-[11px] font-bold text-[#139a91] hover:text-[#0e8b83] flex items-center gap-1 cursor-pointer"
                            >
                              <CalendarPlus className="w-3.5 h-3.5" />
                              <span>Schedule for Class</span>
                            </button>
                          </div>

                          {/* Student List */}
                          <div className="p-3 divide-y divide-[#edf7f6] max-h-56 overflow-y-auto">
                            {classStudents.length === 0 ? (
                              <p className="text-xs text-[#75777f] py-2 text-center">No students registered.</p>
                            ) : (
                              classStudents.map((st) => (
                                <div key={st.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <img
                                      src={st.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                      alt={st.name}
                                      className="w-8 h-8 rounded-full object-cover border border-[#139a91] shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-[#082142] truncate">{st.name}</p>
                                      <p className="text-[10px] text-[#75777f] truncate">ID: {st.rollNumber || st.id}</p>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handleScheduleForSingleStudent(st)}
                                    className="px-2 py-1 rounded-lg bg-[#edf7f6] hover:bg-[#139a91] hover:text-white text-[#082142] text-[11px] font-semibold transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                                  >
                                    <CalendarPlus className="w-3 h-3" />
                                    <span>Target</span>
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Bulletins & Posts */}
      {adminTab === 'posts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleCreatePost} className="lg:col-span-2 bg-white rounded-2xl border border-[#cbe6e3] p-6 sm:p-7 shadow-xs space-y-4">
            <div>
              <h4 className="text-xl font-serif font-bold text-[#082142]">Publish Faculty Bulletin</h4>
              <p className="text-xs text-[#40535e] mt-0.5">Post an official announcement or guidelines to students.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">Bulletin Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Science Fair Safety Briefing or Math Clinic"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">Notice Category</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
                >
                  <option value="announcement">Official Announcement</option>
                  <option value="reminder">Academic Reminder</option>
                  <option value="deadline">Deadline Warning</option>
                  <option value="event">School Event</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">Target Audience</label>
                <select
                  value={postTargetClass}
                  onChange={(e) => setPostTargetClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
                >
                  <option value="ALL">All Classes (Whole School)</option>
                  {CLASS_DIVISIONS.map((div) => (
                    <optgroup key={div.code} label={div.division}>
                      {div.classes.map((c) => (
                        <option key={c} value={c}>Class {c}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#082142]">Message Content *</label>

              {/* AI Writing Assistant for Bulletin */}
              <AIDetailsWriter
                title={postTitle}
                category={postCategory}
                targetAudience={postTargetClass === 'ALL' ? 'Whole School' : `Class ${postTargetClass}`}
                currentText={postMessage}
                contextType="bulletin"
                onApplyText={(text) => setPostMessage(text)}
              />

              <textarea
                rows={4}
                required
                placeholder="Compose announcement body..."
                value={postMessage}
                onChange={(e) => setPostMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91] font-sans leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">Attached Image URL (Optional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={postImageUrl}
                onChange={(e) => setPostImageUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#139a91] hover:bg-[#0e8b83] text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Broadcast Bulletin</span>
            </button>
          </form>

          <div className="bg-white rounded-2xl border border-[#cbe6e3] p-6 shadow-xs space-y-4">
            <h4 className="text-lg font-serif font-bold text-[#082142]">Published Bulletins</h4>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {posts.map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl border border-[#cbe6e3] bg-[#f4f9f8] flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#d2f2ef] text-[#074e48]">
                      {p.category}
                    </span>
                    <h5 className="text-sm font-bold text-[#082142] mt-1 truncate">{p.title}</h5>
                    <p className="text-xs text-[#75777f]">{p.date} • {p.likesCount} Acknowledged</p>
                  </div>
                  <button
                    id={`btn-delete-post-${p.id}`}
                    onClick={() => {
                      setDeleteConfirm({
                        type: 'post',
                        id: p.id,
                        title: p.title,
                        subtitle: `${p.category.toUpperCase()} Bulletin • Published on ${p.date} (${p.targetClass || 'All Classes'})`,
                      });
                    }}
                    className="p-1.5 text-[#75777f] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Bulletin"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Homework & Student Proofs Manager */}
      {adminTab === 'homework' && (() => {
        // Extract all individual student submissions
        const submissionsList: HomeworkItem[] = [];
        homeworkList.forEach(hw => {
          if (hw.submissions && Object.keys(hw.submissions).length > 0) {
            Object.values(hw.submissions).forEach(sub => {
              if (sub.proofImageUrl || sub.submissionStatus !== 'not_submitted') {
                submissionsList.push({
                  ...hw,
                  id: hw.id,
                  submittedByStudentId: sub.studentId,
                  submittedByStudentName: sub.studentName,
                  submittedByStudentClass: sub.studentClass || hw.targetClass,
                  submittedByStudentAvatar: sub.studentAvatar,
                  submissionStatus: sub.submissionStatus,
                  completed: sub.completed,
                  proofImageUrl: sub.proofImageUrl,
                  studentNotes: sub.studentNotes,
                  submittedAt: sub.submittedAt,
                  teacherFeedback: sub.teacherFeedback,
                  reviewedByTeacherName: sub.reviewedByTeacherName,
                  reviewedAt: sub.reviewedAt,
                });
              }
            });
          } else if (Boolean(hw.proofImageUrl) || hw.submissionStatus === 'pending_approval' || hw.submissionStatus === 'approved' || hw.submissionStatus === 'declined') {
            submissionsList.push(hw);
          }
        });

        const pendingList = submissionsList.filter(hw => hw.submissionStatus === 'pending_approval');
        const approvedList = submissionsList.filter(hw => hw.submissionStatus === 'approved');
        const declinedList = submissionsList.filter(hw => hw.submissionStatus === 'declined');

        const filteredSubmissions = submissionsList.filter(hw => {
          if (submissionFilter === 'pending' && hw.submissionStatus !== 'pending_approval') return false;
          if (submissionFilter === 'approved' && hw.submissionStatus !== 'approved') return false;
          if (submissionFilter === 'declined' && hw.submissionStatus !== 'declined') return false;
          
          if (submissionSearch.trim()) {
            const q = submissionSearch.toLowerCase();
            const studentMatch = (hw.submittedByStudentName || '').toLowerCase().includes(q);
            const titleMatch = hw.title.toLowerCase().includes(q);
            const subjectMatch = hw.subject.toLowerCase().includes(q);
            const classMatch = (hw.targetClass || '').toLowerCase().includes(q);
            return studentMatch || titleMatch || subjectMatch || classMatch;
          }
          return true;
        });

        const handleApprove = (hw: HomeworkItem) => {
          if (onReviewSubmission) {
            onReviewSubmission(hw.id, 'approved', 'Verified and approved by faculty.', hw.submittedByStudentId);
          }
          setPlacedConfirmation({
            type: 'homework',
            title: 'Submission Approved',
            message: `"${hw.title}" submitted by ${hw.submittedByStudentName || 'Student'} has been verified and marked completed.`,
            target: hw.submittedByStudentClass || hw.targetClass ? `Class ${hw.submittedByStudentClass || hw.targetClass}` : undefined,
          });
        };

        const handleConfirmDecline = () => {
          if (!decliningItem) return;
          const feedback = declineFeedbackText.trim() || 'Please review requirements and resubmit clear photo proof.';
          if (onReviewSubmission) {
            onReviewSubmission(decliningItem.id, 'declined', feedback, decliningItem.submittedByStudentId);
          }
          setPlacedConfirmation({
            type: 'homework',
            title: 'Revision Requested',
            message: `Feedback sent to ${decliningItem.submittedByStudentName || 'Student'}. Status updated to Revision Needed.`,
            target: decliningItem.submittedByStudentClass || decliningItem.targetClass ? `Class ${decliningItem.submittedByStudentClass || decliningItem.targetClass}` : undefined,
          });
          setDecliningItem(null);
          setDeclineFeedbackText('');
        };

        return (
          <div className="space-y-6">
            {/* Sub-navigation Header */}
            <div className="bg-white p-3 rounded-2xl border border-[#cbe6e3] shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  id="btn-subtab-reviews"
                  onClick={() => setHwSubTab('reviews')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    hwSubTab === 'reviews'
                      ? 'bg-[#139a91] text-white shadow-xs'
                      : 'text-[#40535e] hover:bg-[#edf7f6]'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Student Photo Submissions</span>
                  {pendingList.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950">
                      {pendingList.length} Pending
                    </span>
                  )}
                </button>

                <button
                  id="btn-subtab-publish"
                  onClick={() => setHwSubTab('publish')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    hwSubTab === 'publish'
                      ? 'bg-[#139a91] text-white shadow-xs'
                      : 'text-[#40535e] hover:bg-[#edf7f6]'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish New Assignment</span>
                </button>

                <button
                  id="btn-subtab-assignments"
                  onClick={() => setHwSubTab('assignments')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    hwSubTab === 'assignments'
                      ? 'bg-[#139a91] text-white shadow-xs'
                      : 'text-[#40535e] hover:bg-[#edf7f6]'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>All Active Assignments ({homeworkList.length})</span>
                </button>
              </div>

              <div className="text-xs text-[#75777f] font-semibold px-3 py-1">
                Faculty Portal • Verification Hub
              </div>
            </div>

            {/* Sub-Tab 1: Student Proofs Review Feed */}
            {hwSubTab === 'reviews' && (
              <div className="space-y-6">
                {/* Stats & Search Bar */}
                <div className="bg-white p-5 rounded-2xl border border-[#cbe6e3] shadow-xs space-y-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Filter Pills */}
                    <div className="flex bg-[#edf7f6] p-1 rounded-xl w-full md:w-auto border border-[#cbe6e3] overflow-x-auto">
                      <button
                        onClick={() => setSubmissionFilter('pending')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                          submissionFilter === 'pending'
                            ? 'bg-amber-500 text-white shadow-xs font-bold'
                            : 'text-[#40535e] hover:text-[#082142]'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Review ({pendingList.length})</span>
                      </button>

                      <button
                        onClick={() => setSubmissionFilter('approved')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                          submissionFilter === 'approved'
                            ? 'bg-emerald-600 text-white shadow-xs font-bold'
                            : 'text-[#40535e] hover:text-[#082142]'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approved ({approvedList.length})</span>
                      </button>

                      <button
                        onClick={() => setSubmissionFilter('declined')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                          submissionFilter === 'declined'
                            ? 'bg-red-600 text-white shadow-xs font-bold'
                            : 'text-[#40535e] hover:text-[#082142]'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Declined ({declinedList.length})</span>
                      </button>

                      <button
                        onClick={() => setSubmissionFilter('all')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                          submissionFilter === 'all'
                            ? 'bg-[#082142] text-white shadow-xs font-bold'
                            : 'text-[#40535e] hover:text-[#082142]'
                        }`}
                      >
                        All Submissions ({submissionsList.length})
                      </button>
                    </div>

                    {/* Search Field */}
                    <div className="relative w-full md:w-72">
                      <Search className="w-4 h-4 text-[#75777f] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search student or assignment..."
                        value={submissionSearch}
                        onChange={(e) => setSubmissionSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[#f4f9f8] border border-[#cbe6e3] text-[#082142] placeholder-[#75777f] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
                      />
                    </div>
                  </div>
                </div>

                {/* Submissions List Grid */}
                {filteredSubmissions.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#cbe6e3] p-12 text-center text-[#75777f] shadow-xs">
                    <CheckCircle2 className="w-14 h-14 mx-auto text-[#139a91] mb-3 opacity-40" />
                    <h4 className="text-lg font-serif font-bold text-[#082142]">No homework submissions in this view</h4>
                    <p className="text-xs text-[#40535e] mt-1 max-w-md mx-auto">
                      {submissionFilter === 'pending'
                        ? 'All student homework proofs have been reviewed! When students take and submit new photo proof, they will appear here for verification.'
                        : 'Try switching filters or search terms.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredSubmissions.map((hw) => {
                      const isPending = hw.submissionStatus === 'pending_approval';
                      const isApproved = hw.submissionStatus === 'approved';
                      const isDeclined = hw.submissionStatus === 'declined';
                      const cardKey = `${hw.id}-${hw.submittedByStudentId || 'main'}`;

                      return (
                        <div
                          key={cardKey}
                          id={`teacher-submission-card-${cardKey}`}
                          className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between gap-4 transition-all hover:shadow-md ${
                            isPending
                              ? 'border-amber-300 ring-1 ring-amber-200 bg-gradient-to-b from-white to-amber-50/20'
                              : isApproved
                              ? 'border-emerald-200 bg-emerald-50/10'
                              : 'border-red-200 bg-red-50/10'
                          }`}
                        >
                          <div className="space-y-4">
                            {/* Student Profile Header */}
                            <div className="flex items-start justify-between gap-3 border-b border-[#cbe6e3]/60 pb-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={hw.submittedByStudentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                  alt={hw.submittedByStudentName || 'Student'}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-[#139a91] shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <h4 className="text-sm font-bold text-[#082142]">
                                    {hw.submittedByStudentName || 'Nicholas Tan'}
                                  </h4>
                                  <div className="flex items-center gap-2 text-[11px] text-[#75777f]">
                                    <span className="font-semibold text-[#139a91]">
                                      Class {hw.submittedByStudentClass || hw.targetClass || 'JC1-A'}
                                    </span>
                                    <span>•</span>
                                    <span>{hw.submittedAt || 'Today'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Status Badge & Delete Control */}
                              <div className="flex items-center gap-2">
                                {isPending && (
                                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>Awaiting Review</span>
                                  </span>
                                )}
                                {isApproved && (
                                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                    <span>Approved</span>
                                  </span>
                                )}
                                {isDeclined && (
                                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Revision Needed</span>
                                  </span>
                                )}

                                <button
                                  id={`btn-delete-hw-review-${cardKey}`}
                                  onClick={() => {
                                    setDeleteConfirm({
                                      type: 'homework',
                                      id: hw.id,
                                      title: hw.title,
                                      subtitle: `${hw.subject} • Due ${hw.dueDate} (Class ${hw.targetClass || 'JC1-A'})`,
                                    });
                                  }}
                                  className="p-1.5 text-[#75777f] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Homework Assignment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Assignment Info */}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d2f2ef] text-[#074e48]">
                                  {hw.subject}
                                </span>
                                <span className="text-xs text-[#75777f]">Due: {hw.dueDate}</span>
                              </div>
                              <h5 className="text-base font-bold text-[#082142]">{hw.title}</h5>
                              {hw.description && (
                                <p className="text-xs text-[#40535e] line-clamp-2 mt-0.5">
                                  {hw.description}
                                </p>
                              )}
                            </div>

                            {/* Student Note / Reflection */}
                            {hw.studentNotes && (
                              <div className="p-3 rounded-xl bg-[#f4f9f8] border border-[#cbe6e3] text-xs text-[#082142]">
                                <span className="font-bold text-[#139a91]">Student Note: </span>
                                <span className="text-[#40535e]">"{hw.studentNotes}"</span>
                              </div>
                            )}

                            {/* Photo Proof Box with Click to Zoom */}
                            {hw.proofImageUrl ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs text-[#75777f]">
                                  <span className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                                    <Camera className="w-3 h-3 text-[#139a91]" />
                                    <span>Student Photo Proof</span>
                                  </span>
                                  <button
                                    onClick={() => setLightboxProof({
                                      homeworkId: hw.id,
                                      studentId: hw.submittedByStudentId,
                                      imageUrl: hw.proofImageUrl!,
                                      studentName: hw.submittedByStudentName,
                                      studentClass: hw.submittedByStudentClass || hw.targetClass,
                                      homeworkTitle: hw.title,
                                      subject: hw.subject,
                                      notes: hw.studentNotes,
                                      status: hw.submissionStatus || 'not_submitted',
                                      feedback: hw.teacherFeedback,
                                    })}
                                    className="text-[#139a91] hover:underline font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                                  >
                                    <ZoomIn className="w-3.5 h-3.5" />
                                    <span>Inspect High-Res</span>
                                  </button>
                                </div>

                                <div
                                  onClick={() => setLightboxProof({
                                    homeworkId: hw.id,
                                    studentId: hw.submittedByStudentId,
                                    imageUrl: hw.proofImageUrl!,
                                    studentName: hw.submittedByStudentName,
                                    studentClass: hw.submittedByStudentClass || hw.targetClass,
                                    homeworkTitle: hw.title,
                                    subject: hw.subject,
                                    notes: hw.studentNotes,
                                    status: hw.submissionStatus || 'not_submitted',
                                    feedback: hw.teacherFeedback,
                                  })}
                                  className="relative h-48 rounded-xl overflow-hidden border-2 border-[#cbe6e3] hover:border-[#139a91] cursor-pointer group bg-black/5"
                                >
                                  <img
                                    src={hw.proofImageUrl}
                                    alt="Student Homework Proof"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold text-xs">
                                    <Maximize2 className="w-4 h-4" />
                                    <span>Click to Zoom & Review</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 rounded-xl border border-dashed border-[#cbe6e3] text-center text-xs text-[#75777f] bg-[#f4f9f8]">
                                No photo attached
                              </div>
                            )}

                            {/* Teacher Feedback if already evaluated */}
                            {hw.teacherFeedback && (
                              <div className="p-3 rounded-xl bg-white border border-[#cbe6e3] text-xs">
                                <div className="flex items-center gap-1.5 font-bold text-[#082142] mb-0.5">
                                  <MessageSquare className="w-3.5 h-3.5 text-[#139a91]" />
                                  <span>Feedback from {hw.reviewedByTeacherName || currentTeacher.name}:</span>
                                </div>
                                <p className="text-[#40535e] italic">"{hw.teacherFeedback}"</p>
                              </div>
                            )}
                          </div>

                          {/* Teacher Action Controls */}
                          <div className="border-t border-[#cbe6e3]/60 pt-4 mt-2 flex items-center justify-between gap-3">
                            <button
                              onClick={() => {
                                setDecliningItem(hw);
                                setDeclineFeedbackText(hw.teacherFeedback || '');
                              }}
                              className="px-4 py-2 rounded-full border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                              <span>Decline / Request Revision</span>
                            </button>

                            <button
                              id={`btn-approve-hw-${cardKey}`}
                              onClick={() => handleApprove(hw)}
                              className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md'
                              }`}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>{isApproved ? 'Re-Approve' : 'Approve & Verify'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Sub-Tab 2: Publish Assignment Form */}
            {hwSubTab === 'publish' && (
              <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#cbe6e3] p-6 sm:p-8 shadow-xs space-y-5">
                <div>
                  <h4 className="text-2xl font-serif font-bold text-[#082142]">Publish New Assignment</h4>
                  <p className="text-xs text-[#40535e] mt-1">Assign coursework, problem sets, or readings to BBS students.</p>
                </div>

                <form onSubmit={handleCreateHomework} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">Assignment Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chapter 4 Calculus Problem Set"
                      value={hwTitle}
                      onChange={(e) => setHwTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">Subject</label>
                      <select
                        value={hwSubject}
                        onChange={(e) => setHwSubject(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#cbe6e3] text-xs text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
                      >
                        <option value="Mathematics">Mathematics</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Biology">Biology</option>
                        <option value="English Literature">English Literature</option>
                        <option value="Economics">Economics</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="History">History</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">Target Class</label>
                      <select
                        value={hwTargetClass}
                        onChange={(e) => setHwTargetClass(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#cbe6e3] text-xs text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
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
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#082142] mb-1.5">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={hwDueDate}
                      onChange={(e) => setHwDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-xs text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#082142]">Instructions & Requirements</label>
                    <AIDetailsWriter
                      title={hwTitle}
                      category={hwSubject}
                      targetAudience={`Class ${hwTargetClass}`}
                      currentText={hwDescription}
                      contextType="assignment"
                      onApplyText={(text) => setHwDescription(text)}
                    />
                    <textarea
                      rows={3}
                      placeholder="Include submission steps, rubric notes, required photo proof details..."
                      value={hwDescription}
                      onChange={(e) => setHwDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-[#139a91] font-sans leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-[#139a91] hover:bg-[#0e8b83] text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Publish Assignment to BBS Portal</span>
                  </button>
                </form>
              </div>
            )}

            {/* Sub-Tab 3: All Active Assignments Manager */}
            {hwSubTab === 'assignments' && (
              <div className="bg-white rounded-2xl border border-[#cbe6e3] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-serif font-bold text-[#082142]">All BBS Course Assignments</h4>
                    <p className="text-xs text-[#40535e]">Active assignments published on student calendars and dashboards ({homeworkList.length}).</p>
                  </div>
                  <button
                    onClick={() => setHwSubTab('publish')}
                    className="px-4 py-2 rounded-full bg-[#139a91] hover:bg-[#0e8b83] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Assignment</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {homeworkList.map((hw) => (
                    <div key={hw.id} className="p-4 rounded-xl border border-[#cbe6e3] bg-[#f4f9f8] flex flex-col justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#d2f2ef] text-[#074e48]">{hw.subject}</span>
                          <span className="text-[11px] text-[#75777f]">Due: {hw.dueDate}</span>
                          {hw.targetClass && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#082142] border border-[#cbe6e3]">
                              {hw.targetClass}
                            </span>
                          )}
                        </div>
                        <h5 className="text-sm font-bold text-[#082142]">{hw.title}</h5>
                        {hw.description && <p className="text-xs text-[#40535e] line-clamp-2 leading-relaxed">{hw.description}</p>}
                      </div>

                      <div className="flex items-center justify-between border-t border-[#cbe6e3]/60 pt-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[#75777f]">
                            Status: <strong className="text-[#082142] capitalize">{hw.submissionStatus ? hw.submissionStatus.replace('_', ' ') : (hw.completed ? 'Completed' : 'Open')}</strong>
                          </span>
                          {hw.proofImageUrl && (
                            <button
                              type="button"
                              onClick={() => setLightboxProof({
                                homeworkId: hw.id,
                                imageUrl: hw.proofImageUrl!,
                                studentName: hw.submittedByStudentName,
                                studentClass: hw.targetClass,
                                homeworkTitle: hw.title,
                                subject: hw.subject,
                                notes: hw.studentNotes,
                                status: hw.submissionStatus || 'not_submitted',
                                feedback: hw.teacherFeedback,
                              })}
                              className="text-[11px] font-semibold text-[#139a91] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Proof</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {hw.submissionStatus === 'pending_approval' ? (
                            <button
                              id={`btn-grid-approve-${hw.id}`}
                              onClick={() => handleApprove(hw)}
                              title="Approve & Verify Submission"
                              className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-xs hover:shadow-md"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Approve</span>
                            </button>
                          ) : hw.submissionStatus === 'approved' || hw.completed ? (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Approved</span>
                            </span>
                          ) : (
                            <button
                              id={`btn-grid-mark-approve-${hw.id}`}
                              onClick={() => handleApprove(hw)}
                              title="Mark & Verify as Approved"
                              className="px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Approve</span>
                            </button>
                          )}

                          <button
                            id={`btn-delete-hw-grid-${hw.id}`}
                            onClick={() => {
                              setDeleteConfirm({
                                type: 'homework',
                                id: hw.id,
                                title: hw.title,
                                subtitle: `${hw.subject} • Due ${hw.dueDate} (${hw.targetClass || 'All Classes'})`,
                              });
                            }}
                            className="p-1.5 text-[#75777f] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lightbox Modal for High-Resolution Photo Proof Inspection */}
            {lightboxProof && (
              <div 
                id="photo-proof-lightbox-modal"
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
              >
                <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-white/20">
                  {/* Lightbox Header */}
                  <div className="p-4 sm:p-5 bg-[#082142] text-white flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#139a91] text-white">
                          {lightboxProof.subject}
                        </span>
                        <span className="text-xs text-white/80">
                          Student: <strong>{lightboxProof.studentName || 'Nicholas Tan'}</strong> ({lightboxProof.studentClass || 'JC1-A'})
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white mt-1">
                        {lightboxProof.homeworkTitle}
                      </h4>
                    </div>

                    <button
                      onClick={() => setLightboxProof(null)}
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Photo Body */}
                  <div className="flex-1 bg-neutral-900 overflow-auto flex items-center justify-center p-4 min-h-[350px]">
                    <img
                      src={lightboxProof.imageUrl}
                      alt="Student Proof High Resolution"
                      className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg"
                    />
                  </div>

                  {/* Lightbox Footer & Action Controls */}
                  <div className="p-4 sm:p-5 bg-white border-t border-[#cbe6e3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {lightboxProof.notes ? (
                      <div className="text-xs text-[#40535e] flex-1">
                        <strong className="text-[#082142]">Student Remarks:</strong> "{lightboxProof.notes}"
                      </div>
                    ) : (
                      <div className="text-xs text-[#75777f] flex-1">
                        High resolution camera snapshot taken by student.
                      </div>
                    )}

                    <div className="flex items-center gap-3 justify-end">
                      <button
                        onClick={() => {
                          const target = homeworkList.find(h => h.id === lightboxProof.homeworkId);
                          if (target) {
                            setLightboxProof(null);
                            const targetWithStudent: HomeworkItem = {
                              ...target,
                              submittedByStudentId: lightboxProof.studentId || target.submittedByStudentId,
                              submittedByStudentName: lightboxProof.studentName || target.submittedByStudentName,
                              submittedByStudentClass: lightboxProof.studentClass || target.targetClass,
                            };
                            setDecliningItem(targetWithStudent);
                            setDeclineFeedbackText(target.teacherFeedback || '');
                          }
                        }}
                        className="px-4 py-2 rounded-full border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        <span>Decline / Request Revision</span>
                      </button>

                      <button
                        id="btn-lightbox-approve-hw"
                        onClick={() => {
                          const target = homeworkList.find(h => h.id === lightboxProof.homeworkId);
                          if (target) {
                            const targetWithStudent: HomeworkItem = {
                              ...target,
                              submittedByStudentId: lightboxProof.studentId || target.submittedByStudentId,
                              submittedByStudentName: lightboxProof.studentName || target.submittedByStudentName,
                              submittedByStudentClass: lightboxProof.studentClass || target.targetClass,
                            };
                            handleApprove(targetWithStudent);
                            setLightboxProof(null);
                          }
                        }}
                        className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Approve & Verify</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Decline Feedback Dialog */}
            {decliningItem && (
              <div 
                id="decline-feedback-modal"
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
              >
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#cbe6e3] space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-red-100 text-red-700">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-[#082142]">Request Homework Revision</h4>
                        <p className="text-xs text-[#40535e]">
                          Send feedback to {decliningItem.submittedByStudentName || 'the student'} so they can resubmit.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDecliningItem(null)}
                      className="p-1 text-[#75777f] hover:text-[#082142] rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Assignment quick info */}
                  <div className="p-3 bg-[#f4f9f8] rounded-xl border border-[#cbe6e3] text-xs space-y-1">
                    <div className="font-bold text-[#082142]">{decliningItem.title}</div>
                    <div className="text-[#75777f]">Subject: {decliningItem.subject} • Class {decliningItem.targetClass || 'JC1-A'}</div>
                  </div>

                  {/* Quick preset suggestions */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#082142]">
                      Quick Feedback Templates
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Please show step-by-step mathematical working.',
                        'Photo is too blurry/dark. Please retake with good lighting.',
                        'Incomplete problems on page 2. Please finish and resubmit.',
                        'Missing required diagrams and labels.',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setDeclineFeedbackText(preset)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#edf7f6] hover:bg-[#d2f2ef] text-[#074e48] border border-[#cbe6e3] transition-colors text-left cursor-pointer"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Feedback Textarea */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#082142]">
                      Teacher Feedback Note *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Explain what needs to be improved or corrected before resubmission..."
                      value={declineFeedbackText}
                      onChange={(e) => setDeclineFeedbackText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbe6e3] text-sm text-[#082142] bg-[#f4f9f8] focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Dialog Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setDecliningItem(null)}
                      className="px-4 py-2 rounded-full text-xs font-semibold text-[#75777f] hover:bg-[#edf7f6]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDecline}
                      className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Feedback & Decline</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Warning Confirmation Modal for Deleting Homework, Events, or Posts */}
            {deleteConfirm && (
              <div 
                id="delete-confirmation-modal"
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
              >
                <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#cbe6e3] space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 shrink-0">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <h4 className="text-lg font-serif font-bold text-[#082142]">
                        Delete {deleteConfirm.type === 'homework' ? 'Homework Assignment' : deleteConfirm.type === 'event' ? 'School Event' : 'Faculty Bulletin'}?
                      </h4>
                      <p className="text-xs text-[#40535e] leading-relaxed">
                        Are you sure you want to permanently remove <strong className="text-[#082142]">"{deleteConfirm.title}"</strong>?
                      </p>
                      {deleteConfirm.subtitle && (
                        <div className="text-[11px] text-[#75777f] mt-1.5 bg-[#f4f9f8] p-2.5 rounded-xl border border-[#cbe6e3]">
                          {deleteConfirm.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <span>Warning: This will permanently delete this item from all student dashboards, calendars, and BBS records.</span>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(null)}
                      className="px-4 py-2.5 rounded-full border border-[#cbe6e3] text-[#40535e] hover:bg-[#edf7f6] text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      id="btn-confirm-delete-action"
                      onClick={() => {
                        if (deleteConfirm.type === 'homework') {
                          onDeleteHomework(deleteConfirm.id);
                        } else if (deleteConfirm.type === 'event') {
                          onDeleteEvent(deleteConfirm.id);
                        } else if (deleteConfirm.type === 'post') {
                          onDeletePost(deleteConfirm.id);
                        }
                        setDeleteConfirm(null);
                      }}
                      className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Permanently</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
