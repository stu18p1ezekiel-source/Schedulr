import React, { useState, useEffect, useMemo } from 'react';
import { 
  INITIAL_STUDENTS, 
  TEACHERS, 
  INITIAL_EVENTS, 
  INITIAL_HOMEWORK, 
  INITIAL_POSTS,
  CLASSES
} from './mockData';
import { 
  Student, 
  Teacher, 
  EventItem, 
  HomeworkItem, 
  StudentSubmission,
  TeacherPost, 
  ActiveTab 
} from './types';

// Components
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { WeeklyProgressCard } from './components/WeeklyProgressCard';
import { UpcomingDeadlinesCard } from './components/UpcomingDeadlinesCard';
import { FeaturedResourceCard } from './components/FeaturedResourceCard';
import { CalendarView } from './components/CalendarView';
import { HomeworkView } from './components/HomeworkView';
import { PostsView } from './components/PostsView';
import { ProfileView } from './components/ProfileView';
import { TeacherAdminView } from './components/TeacherAdminView';
import { BottomNav } from './components/BottomNav';
import { EventModal } from './components/EventModal';
import { AddHomeworkModal } from './components/AddHomeworkModal';
import { LoginModal } from './components/LoginModal';
import { LoginScreen } from './components/LoginScreen';
import { NotificationToast, NotificationItem } from './components/NotificationToast';

export function normalizeHomeworkItem(hw: HomeworkItem): HomeworkItem {
  const submissions: Record<string, StudentSubmission> = { ...(hw.submissions || {}) };

  // If there is legacy top-level submission data but no submissions map entry
  if (hw.submittedByStudentId && !submissions[hw.submittedByStudentId]) {
    submissions[hw.submittedByStudentId] = {
      studentId: hw.submittedByStudentId,
      studentName: hw.submittedByStudentName || 'Student',
      studentClass: hw.submittedByStudentClass || hw.targetClass,
      studentAvatar: hw.submittedByStudentAvatar,
      submissionStatus: hw.submissionStatus || 'not_submitted',
      completed: Boolean(hw.completed),
      proofImageUrl: hw.proofImageUrl,
      studentNotes: hw.studentNotes,
      submittedAt: hw.submittedAt,
      teacherFeedback: hw.teacherFeedback,
      reviewedByTeacherName: hw.reviewedByTeacherName,
      reviewedAt: hw.reviewedAt,
    };
  }

  return {
    ...hw,
    submissions,
  };
}

export function getHomeworkForStudent(hw: HomeworkItem, studentId?: string): HomeworkItem {
  if (!studentId) return hw;

  const sub = hw.submissions?.[studentId];
  if (sub) {
    return {
      ...hw,
      completed: sub.completed,
      submissionStatus: sub.submissionStatus,
      proofImageUrl: sub.proofImageUrl,
      submittedAt: sub.submittedAt,
      submittedByStudentId: sub.studentId,
      submittedByStudentName: sub.studentName,
      submittedByStudentClass: sub.studentClass || hw.targetClass,
      submittedByStudentAvatar: sub.studentAvatar,
      studentNotes: sub.studentNotes,
      teacherFeedback: sub.teacherFeedback,
      reviewedByTeacherName: sub.reviewedByTeacherName,
      reviewedAt: sub.reviewedAt,
    };
  }

  // If this homework was personally created by this student (studentId)
  if (hw.studentId === studentId) {
    return hw;
  }

  // If it is targeted to a single specific student who is this student
  if (hw.targetAudience === 'SINGLE_STUDENT' && hw.targetStudentIds?.includes(studentId)) {
    return hw;
  }

  // Otherwise, this student has NOT completed or submitted this shared class-wide homework yet
  return {
    ...hw,
    completed: false,
    submissionStatus: 'not_submitted',
    proofImageUrl: undefined,
    submittedAt: undefined,
    submittedByStudentId: undefined,
    submittedByStudentName: undefined,
    submittedByStudentClass: undefined,
    submittedByStudentAvatar: undefined,
    studentNotes: undefined,
    teacherFeedback: undefined,
    reviewedByTeacherName: undefined,
    reviewedAt: undefined,
  };
}

export default function App() {
  // Authentication Gate State - Always starts at Login Screen
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Global Notification Queue (Prominent Checkmark Toasts)
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const showNotification = (notification: Omit<NotificationItem, 'id'>) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Persistence: Student Login State (remembering name and class)
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('bbs_students');
      if (saved) {
        const parsed: Student[] = JSON.parse(saved);
        return INITIAL_STUDENTS.map(initS => {
          const match = parsed.find(p => p.id === initS.id);
          return match ? { ...match, avatarUrl: initS.avatarUrl, email: initS.email } : initS;
        });
      }
    } catch (e) {
      console.warn('Failed to load students:', e);
    }
    return INITIAL_STUDENTS;
  });

  const [currentStudent, setCurrentStudent] = useState<Student | null>(() => {
    try {
      const savedId = localStorage.getItem('bbs_current_student_id');
      if (savedId) {
        const match = INITIAL_STUDENTS.find(s => s.id === savedId);
        if (match) return match;
      }
    } catch (e) {
      console.warn('Failed to load current student:', e);
    }
    return INITIAL_STUDENTS[0];
  });

  // Teacher Mode State
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(false);

  const [currentTeacher, setCurrentTeacher] = useState<Teacher>(() => {
    try {
      const savedId = localStorage.getItem('bbs_current_teacher_id');
      if (savedId) {
        const match = TEACHERS.find(t => t.id === savedId);
        if (match) return match;
      }
    } catch (e) {
      console.warn('Failed to load current teacher:', e);
    }
    return TEACHERS[0];
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginModalMode, setLoginModalMode] = useState<'student' | 'teacher'>('student');
  const [isAddHomeworkOpen, setIsAddHomeworkOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Application Data State with LocalStorage Persistence
  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const saved = localStorage.getItem('bbs_events');
      if (saved) {
        const parsed: EventItem[] = JSON.parse(saved);
        return parsed.map(p => {
          const match = INITIAL_EVENTS.find(initE => initE.id === p.id);
          return match?.imageUrl ? { ...p, imageUrl: match.imageUrl } : p;
        });
      }
    } catch (e) {
      console.warn('Failed to load events:', e);
    }
    return INITIAL_EVENTS;
  });

  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>(() => {
    try {
      const saved = localStorage.getItem('bbs_homework');
      const loaded: HomeworkItem[] = saved ? JSON.parse(saved) : INITIAL_HOMEWORK;
      return loaded.map(normalizeHomeworkItem);
    } catch (e) {
      console.warn('Failed to load homework:', e);
      return INITIAL_HOMEWORK.map(normalizeHomeworkItem);
    }
  });

  const [posts, setPosts] = useState<TeacherPost[]>(() => {
    try {
      const saved = localStorage.getItem('bbs_posts');
      if (saved) {
        const parsed: TeacherPost[] = JSON.parse(saved);
        return parsed.map(p => {
          const match = INITIAL_POSTS.find(initP => initP.id === p.id);
          return match?.imageUrl ? { ...p, imageUrl: match.imageUrl } : p;
        });
      }
    } catch (e) {
      console.warn('Failed to load posts:', e);
    }
    return INITIAL_POSTS;
  });

  // Selected Month Date for Calendar (August 27, 2026)
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(new Date(2026, 7, 27)); // Aug 27, 2026

  // Save to LocalStorage with robust error recovery
  useEffect(() => {
    if (currentStudent) {
      try {
        localStorage.setItem('bbs_current_student_id', currentStudent.id);
      } catch (err) {
        console.warn('Failed to save student ID to storage:', err);
      }
    }
  }, [currentStudent]);

  useEffect(() => {
    try {
      localStorage.setItem('bbs_events', JSON.stringify(events));
    } catch (err) {
      console.warn('Failed to save events to storage:', err);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem('bbs_homework', JSON.stringify(homeworkList));
    } catch (err) {
      console.warn('Failed to save homework to storage (quota exceeded):', err);
      // Fallback: If quota exceeded due to large embedded images, save lean version without base64 strings
      try {
        const leanHomework = homeworkList.map(h => {
          const cleanSubs = { ...(h.submissions || {}) };
          Object.keys(cleanSubs).forEach(k => {
            if (cleanSubs[k].proofImageUrl?.startsWith('data:')) {
              cleanSubs[k] = { ...cleanSubs[k], proofImageUrl: undefined };
            }
          });
          return {
            ...h,
            submissions: cleanSubs,
            proofImageUrl: h.proofImageUrl && h.proofImageUrl.startsWith('data:') ? undefined : h.proofImageUrl
          };
        });
        localStorage.setItem('bbs_homework', JSON.stringify(leanHomework));
      } catch (innerErr) {
        console.warn('Fallback homework save failed:', innerErr);
      }
    }
  }, [homeworkList]);

  useEffect(() => {
    try {
      localStorage.setItem('bbs_posts', JSON.stringify(posts));
    } catch (err) {
      console.warn('Failed to save posts to storage:', err);
    }
  }, [posts]);

  // Filtered Homework resolved specifically for the current active student (always executed unconditionally)
  const studentVisibleHomework = useMemo(() => {
    return homeworkList
      .filter((hw) => {
        if (!currentStudent) return true;
        if (hw.targetAudience === 'ALL') return true;
        if (hw.targetAudience === 'CLASS') {
          return !hw.targetClass || hw.targetClass === currentStudent.classId;
        }
        if (
          hw.targetAudience === 'GROUP_STUDENTS' || 
          hw.targetAudience === 'SINGLE_STUDENT' || 
          hw.targetAudience === 'SPECIFIC_STUDENTS'
        ) {
          return hw.targetStudentIds?.includes(currentStudent.id) || hw.studentId === currentStudent.id;
        }
        return true;
      })
      .map((hw) => getHomeworkForStudent(hw, currentStudent?.id));
  }, [homeworkList, currentStudent]);

  // Homework Handlers with individual per-student submission tracking
  const handleToggleHomework = (id: string) => {
    const studentId = currentStudent?.id;
    setHomeworkList(prev =>
      prev.map(item => {
        if (item.id !== id) return item;

        if (!studentId) {
          return { ...item, completed: !item.completed };
        }

        const existingSub = item.submissions?.[studentId];
        const newCompleted = existingSub ? !existingSub.completed : !item.completed;
        const updatedSub: StudentSubmission = {
          studentId,
          studentName: currentStudent?.name || 'Student',
          studentClass: currentStudent?.classId || item.targetClass,
          studentAvatar: currentStudent?.avatarUrl,
          submissionStatus: newCompleted ? 'approved' : 'not_submitted',
          completed: newCompleted,
          proofImageUrl: existingSub?.proofImageUrl,
          studentNotes: existingSub?.studentNotes,
          submittedAt: existingSub?.submittedAt,
          teacherFeedback: existingSub?.teacherFeedback,
          reviewedByTeacherName: existingSub?.reviewedByTeacherName,
          reviewedAt: existingSub?.reviewedAt,
        };

        const newSubmissions = {
          ...(item.submissions || {}),
          [studentId]: updatedSub,
        };

        return {
          ...item,
          submissions: newSubmissions,
          ...(item.targetAudience === 'SINGLE_STUDENT' || item.studentId === studentId ? { completed: newCompleted } : {}),
        };
      })
    );
  };

  const handleSubmitProof = (homeworkId: string, proofImageUrl: string, studentNotes?: string) => {
    const currentTimestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const targetHw = homeworkList.find(h => h.id === homeworkId);
    const studentId = currentStudent?.id || 's-101';
    const studentName = currentStudent?.name || 'Nicholas Tan';
    const studentClass = currentStudent?.classId || targetHw?.targetClass || 'JC1-A';
    const studentAvatar = currentStudent?.avatarUrl;

    const newSubmission: StudentSubmission = {
      studentId,
      studentName,
      studentClass,
      studentAvatar,
      submissionStatus: 'pending_approval',
      completed: false,
      proofImageUrl,
      studentNotes: studentNotes || undefined,
      submittedAt: currentTimestamp,
    };

    setHomeworkList(prev =>
      prev.map(item => {
        if (item.id !== homeworkId) return item;

        const newSubmissions = {
          ...(item.submissions || {}),
          [studentId]: newSubmission,
        };

        return {
          ...item,
          submissions: newSubmissions,
          // Backwards compatibility for single-student assignments or initial review
          ...(item.targetAudience === 'SINGLE_STUDENT' || item.studentId === studentId || !item.submittedByStudentId || item.submittedByStudentId === studentId ? {
            submissionStatus: 'pending_approval',
            completed: false,
            proofImageUrl,
            studentNotes: studentNotes || undefined,
            submittedAt: currentTimestamp,
            submittedByStudentId: studentId,
            submittedByStudentName: studentName,
            submittedByStudentClass: studentClass,
            submittedByStudentAvatar: studentAvatar,
          } : {}),
        };
      })
    );

    showNotification({
      type: 'homework',
      title: 'Homework Proof Submitted',
      message: `Photo proof for "${targetHw?.title || 'Assignment'}" has been submitted for teacher verification.`,
      detail: 'Your teacher will review your submission and approve completion.',
    });
  };

  const handleReviewSubmission = (homeworkId: string, status: 'approved' | 'declined', feedback?: string, studentId?: string) => {
    const currentTimestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const targetHw = homeworkList.find(h => h.id === homeworkId);

    setHomeworkList(prev =>
      prev.map(item => {
        if (item.id !== homeworkId) return item;

        const newSubmissions = { ...(item.submissions || {}) };
        const targetStudentId = studentId || item.submittedByStudentId || Object.keys(newSubmissions)[0];

        if (targetStudentId && newSubmissions[targetStudentId]) {
          newSubmissions[targetStudentId] = {
            ...newSubmissions[targetStudentId],
            submissionStatus: status,
            completed: status === 'approved',
            teacherFeedback: feedback || (status === 'approved' ? 'Verified by faculty counselor.' : 'Revision requested.'),
            reviewedByTeacherName: currentTeacher?.name || 'Faculty Counselor',
            reviewedAt: currentTimestamp,
          };
        }

        return {
          ...item,
          submissions: newSubmissions,
          ...(targetStudentId === item.submittedByStudentId || !item.submittedByStudentId ? {
            submissionStatus: status,
            completed: status === 'approved',
            teacherFeedback: feedback || (status === 'approved' ? 'Verified by faculty counselor.' : 'Revision requested.'),
            reviewedByTeacherName: currentTeacher?.name || 'Faculty Counselor',
            reviewedAt: currentTimestamp,
          } : {}),
        };
      })
    );

    showNotification({
      type: 'homework',
      title: status === 'approved' ? 'Submission Approved' : 'Revision Requested',
      message: status === 'approved'
        ? `"${targetHw?.title || 'Assignment'}" has been verified and marked complete.`
        : `Feedback sent for "${targetHw?.title || 'Assignment'}".`,
      detail: `Reviewer: ${currentTeacher?.name || 'Teacher'}`,
    });
  };

  const handleAddHomework = (newHwData: Omit<HomeworkItem, 'id' | 'completed'>) => {
    const newItem: HomeworkItem = {
      ...newHwData,
      id: `hw-${Date.now()}`,
      completed: false,
    };
    setHomeworkList(prev => [newItem, ...prev]);

    showNotification({
      type: 'homework',
      title: 'Assignment has been placed',
      message: `"${newHwData.title}" has been assigned to ${newHwData.targetClass ? `Class ${newHwData.targetClass}` : 'your tasks'}.`,
      detail: newHwData.dueDate ? `Due date: ${newHwData.dueDate}` : undefined,
    });
  };

  const handleDeleteHomework = (id: string) => {
    setHomeworkList(prev => prev.filter(item => item.id !== id));
  };

  // Event Handlers
  const handleAddEvent = (newEventData: Omit<EventItem, 'id'>) => {
    const newItem: EventItem = {
      ...newEventData,
      id: `ev-${Date.now()}`,
    };
    setEvents(prev => [...prev, newItem]);

    // Also automatically create and post to the Faculty Bulletins (Posts feed)
    const counselorName = newEventData.counselors?.[0] || currentTeacher?.name || 'Faculty Advisor';
    const counselorObj = TEACHERS.find(t => t.name === counselorName) || currentTeacher;

    const eventDateFormatted = (() => {
      try {
        if (newEventData.date) {
          const [y, m, d] = newEventData.date.split('-').map(Number);
          const dt = new Date(y, m - 1, d);
          return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        return 'Upcoming Event';
      } catch (e) {
        return newEventData.date;
      }
    })();

    const scheduleDetails: string[] = [
      `📅 Event Date: ${eventDateFormatted}`,
    ];
    if (newEventData.startTime) {
      scheduleDetails.push(`⏰ Time: ${newEventData.startTime}${newEventData.endTime ? ` - ${newEventData.endTime}` : ''}`);
    }
    if (newEventData.location) {
      scheduleDetails.push(`📍 Location: ${newEventData.location}`);
    }

    const eventPostItem: TeacherPost = {
      id: `post-ev-${Date.now()}`,
      teacherName: counselorObj?.name || counselorName,
      teacherRole: counselorObj?.role || 'Event Coordinator & Faculty Counselor',
      teacherAvatar: counselorObj?.avatarUrl,
      title: `${newEventData.title}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      category: 'event',
      fullMessage: `${scheduleDetails.join(' • ')}\n\n${newEventData.details}`,
      imageUrl: newEventData.imageUrl,
      targetClass: newEventData.targetAudience === 'ALL' ? 'ALL' : newEventData.targetClass,
      targetStudentIds: newEventData.targetStudentIds,
      likesCount: 0,
      likedByCurrentUser: false,
    };

    setPosts(prev => [eventPostItem, ...prev]);

    let audienceDetail = 'Target: All Classes (School-wide)';
    if (newEventData.targetAudience === 'CLASS') {
      audienceDetail = `Target: Class ${newEventData.targetClass}`;
    } else if (newEventData.targetAudience === 'GROUP_STUDENTS') {
      audienceDetail = `Target: Selected students in Class ${newEventData.targetClass}`;
    } else if (newEventData.targetAudience === 'SINGLE_STUDENT') {
      audienceDetail = `Target: Individual student (${newEventData.targetClass})`;
    }

    showNotification({
      type: 'event',
      title: 'Event & Bulletin post placed',
      message: `"${newEventData.title}" is now added to the BBS Calendar & Posts feed.`,
      detail: `${audienceDetail} • Event Date: ${newEventData.date}`,
    });
  };

  const handleDeleteEvent = (id: string) => {
    if (!isTeacherMode) return;
    const deletedItem = events.find(item => item.id === id);
    setEvents(prev => prev.filter(item => item.id !== id));
    if (selectedEvent?.id === id) {
      setSelectedEvent(null);
    }
    showNotification({
      type: 'event',
      title: 'Event Removed',
      message: deletedItem ? `"${deletedItem.title}" has been deleted from the BBS Calendar.` : 'Event deleted from calendar.',
      detail: 'Updated calendar and schedule overview.',
    });
  };

  // Post Handlers
  const handleAddPost = (newPostData: Omit<TeacherPost, 'id' | 'likesCount' | 'likedByCurrentUser'>) => {
    const newItem: TeacherPost = {
      ...newPostData,
      id: `post-${Date.now()}`,
      likesCount: 0,
      likedByCurrentUser: false,
    };
    setPosts(prev => [newItem, ...prev]);

    const targetDesc = newPostData.targetClass && newPostData.targetClass !== 'ALL'
      ? `Class ${newPostData.targetClass}`
      : 'All Classes';

    showNotification({
      type: 'post',
      title: 'Post has been placed',
      message: `"${newPostData.title}" is now published on the student bulletin.`,
      detail: `Audience: ${targetDesc} • Category: ${newPostData.category.toUpperCase()}`,
    });
  };

  const handleDeletePost = (id: string) => {
    if (!isTeacherMode) return;
    const deletedItem = posts.find(item => item.id === id);
    setPosts(prev => prev.filter(item => item.id !== id));
    showNotification({
      type: 'post',
      title: 'Post Removed',
      message: deletedItem ? `"${deletedItem.title}" has been deleted.` : 'Bulletin post deleted.',
      detail: 'The bulletin feed has been updated.',
    });
  };

  const handleToggleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const isLiked = p.likedByCurrentUser;
          return {
            ...p,
            likedByCurrentUser: !isLiked,
            likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
          };
        }
        return p;
      })
    );
  };

  // Student & Teacher Login Handlers
  const handleStudentLogin = (student: Student) => {
    setCurrentStudent(student);
    setIsTeacherMode(false);
    setIsAuthenticated(true);
    localStorage.setItem('bbs_is_authenticated', 'true');
    localStorage.setItem('bbs_user_role', 'student');
    localStorage.setItem('bbs_current_student_id', student.id);
    if (!students.some(s => s.id === student.id)) {
      setStudents(prev => [...prev, student]);
    }
    setActiveTab('home');
  };

  const handleTeacherLogin = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    setIsTeacherMode(true);
    setIsAuthenticated(true);
    localStorage.setItem('bbs_is_authenticated', 'true');
    localStorage.setItem('bbs_user_role', 'teacher');
    localStorage.setItem('bbs_current_teacher_id', teacher.id);
    setActiveTab('admin');
  };

  // Sign Out Handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('bbs_is_authenticated');
    localStorage.removeItem('bbs_user_role');
  };

  // If not authenticated, render dedicated BBS Gateway & Login Screen
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onStudentLogin={handleStudentLogin}
        onTeacherLogin={handleTeacherLogin}
        allStudents={students}
      />
    );
  }

  const pendingHomeworkCount = studentVisibleHomework.filter(h => !h.completed).length;
  const completedHomeworkCount = studentVisibleHomework.filter(h => h.completed).length;

  const currentMonthName = selectedMonthDate.toLocaleDateString('en-US', { month: 'long' });
  const currentYear = selectedMonthDate.getFullYear();

  return (
    <div className="min-h-screen bg-[#f4f9f8] flex flex-col md:flex-row text-[#082142] antialiased selection:bg-[#139a91] selection:text-white">
      {/* Desktop Sidebar with BBS Logo and Colors */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentStudent={currentStudent}
        currentTeacher={currentTeacher}
        isTeacherMode={isTeacherMode}
        setIsTeacherMode={setIsTeacherMode}
        onOpenLogin={() => {
          setLoginModalMode('student');
          setIsLoginModalOpen(true);
        }}
        onOpenTeacherLogin={() => {
          setLoginModalMode('teacher');
          setIsLoginModalOpen(true);
        }}
        onLogout={handleLogout}
        pendingHomeworkCount={pendingHomeworkCount}
      />

      {/* Main Content Area */}
      <main id="main-content-viewport" className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Top Header */}
          <TopHeader
            activeTab={activeTab}
            currentStudent={currentStudent}
            currentTeacher={currentTeacher}
            currentMonthName={currentMonthName}
            currentYear={currentYear}
            onOpenAddHomework={() => setIsAddHomeworkOpen(true)}
            onOpenAddEvent={
              isTeacherMode ? () => setActiveTab('admin') : undefined
            }
            isTeacherMode={isTeacherMode}
            onToggleTeacherMode={() => {
              if (isTeacherMode) {
                setIsTeacherMode(false);
                setActiveTab('home');
              } else {
                setLoginModalMode('teacher');
                setIsLoginModalOpen(true);
              }
            }}
            onLogout={handleLogout}
          />

          {/* Active View Router */}
          {activeTab === 'home' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Calendar as Main Focus */}
              <CalendarView
                events={events}
                homeworkList={studentVisibleHomework}
                currentStudent={currentStudent}
                onSelectEvent={(event) => setSelectedEvent(event)}
                onDeleteEvent={isTeacherMode ? handleDeleteEvent : undefined}
                isTeacherMode={isTeacherMode}
                onSelectHomework={(hw) => {
                  setActiveTab('homework');
                }}
                onDayClick={(dateStr) => {
                  // Optional quick inspect
                }}
                selectedMonthDate={selectedMonthDate}
                setSelectedMonthDate={setSelectedMonthDate}
              />

              {/* Home Bottom Cards: Deadlines & Progress & Resource Hub */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <UpcomingDeadlinesCard
                    homeworkList={studentVisibleHomework}
                    onToggleComplete={handleToggleHomework}
                    onViewAll={() => setActiveTab('homework')}
                    onOpenItem={() => setActiveTab('homework')}
                  />
                </div>

                <div className="lg:col-span-1">
                  <WeeklyProgressCard
                    completedCount={completedHomeworkCount}
                    totalCount={studentVisibleHomework.length}
                    onViewHomework={() => setActiveTab('homework')}
                  />
                </div>

                <div className="lg:col-span-1">
                  <FeaturedResourceCard />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <CalendarView
                events={events}
                homeworkList={studentVisibleHomework}
                currentStudent={currentStudent}
                onSelectEvent={(event) => setSelectedEvent(event)}
                onDeleteEvent={isTeacherMode ? handleDeleteEvent : undefined}
                isTeacherMode={isTeacherMode}
                onSelectHomework={(hw) => {
                  setActiveTab('homework');
                }}
                selectedMonthDate={selectedMonthDate}
                setSelectedMonthDate={setSelectedMonthDate}
              />
            </div>
          )}

          {activeTab === 'homework' && (
            <div className="animate-in fade-in duration-300">
              <HomeworkView
                homeworkList={studentVisibleHomework}
                currentStudent={currentStudent}
                onToggleComplete={handleToggleHomework}
                onOpenAddHomework={() => setIsAddHomeworkOpen(true)}
                onSubmitProof={handleSubmitProof}
              />
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="animate-in fade-in duration-300">
              <PostsView
                posts={posts}
                currentStudent={currentStudent}
                onToggleLike={handleToggleLike}
                isTeacherMode={isTeacherMode}
                onOpenCreatePost={() => setActiveTab('admin')}
                onDeletePost={isTeacherMode ? handleDeletePost : undefined}
              />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="animate-in fade-in duration-300">
              <ProfileView
                currentStudent={currentStudent}
                homeworkList={studentVisibleHomework}
                onOpenLogin={() => {
                  setLoginModalMode('student');
                  setIsLoginModalOpen(true);
                }}
                onOpenTeacherLogin={() => {
                  setLoginModalMode('teacher');
                  setIsLoginModalOpen(true);
                }}
                isTeacherMode={isTeacherMode}
                onSwitchStudent={(st) => setCurrentStudent(st)}
                onLogout={handleLogout}
                allStudents={students}
              />
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="animate-in fade-in duration-300">
              <TeacherAdminView
                currentTeacher={currentTeacher}
                events={events}
                homeworkList={homeworkList}
                posts={posts}
                students={students}
                onAddEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
                onAddHomework={handleAddHomework}
                onDeleteHomework={handleDeleteHomework}
                onAddPost={handleAddPost}
                onDeletePost={handleDeletePost}
                onReviewSubmission={handleReviewSubmission}
                onExitTeacherMode={() => {
                  setIsTeacherMode(false);
                  setActiveTab('home');
                }}
                onLogout={handleLogout}
              />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isTeacherMode={isTeacherMode}
        onOpenTeacherLogin={() => {
          setLoginModalMode('teacher');
          setIsLoginModalOpen(true);
        }}
        pendingHomeworkCount={pendingHomeworkCount}
      />

      {/* Event Details Lightbox / Modal */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDeleteEvent={isTeacherMode ? handleDeleteEvent : undefined}
        isTeacherMode={isTeacherMode}
      />

      {/* Add Homework Modal */}
      <AddHomeworkModal
        isOpen={isAddHomeworkOpen}
        onClose={() => setIsAddHomeworkOpen(false)}
        onAddHomework={handleAddHomework}
        currentStudent={currentStudent}
        isTeacherMode={isTeacherMode}
        allStudents={students}
      />

      {/* Login & Faculty Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialMode={loginModalMode}
        onStudentLogin={handleStudentLogin}
        onTeacherLogin={handleTeacherLogin}
        allStudents={students}
      />

      {/* Prominent Checkmark Notification Toast Overlay */}
      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}
