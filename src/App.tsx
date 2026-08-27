import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import {
  fetchServerState,
  connectLiveSync,
  createEventApi,
  deleteEventApi,
  createHomeworkApi,
  deleteHomeworkApi,
  toggleHomeworkApi,
  submitHomeworkProofApi,
  reviewSubmissionApi,
  createPostApi,
  deletePostApi,
  togglePostLikeApi,
  updateStudentApi,
  AppState,
} from './services/api';

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

  // Multi-Device Live Synchronization Connection State
  const [isLiveSynced, setIsLiveSynced] = useState<boolean>(true);

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

  // Application Data State with Local Storage and Server Database Sync
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

  // Real-time Database Synchronization Effect
  const applyServerState = useCallback((state: AppState) => {
    if (!state) return;
    if (Array.isArray(state.events)) {
      setEvents(state.events);
    }
    if (Array.isArray(state.homework)) {
      setHomeworkList(state.homework.map(normalizeHomeworkItem));
    }
    if (Array.isArray(state.posts)) {
      setPosts(state.posts);
    }
    if (Array.isArray(state.students) && state.students.length > 0) {
      setStudents(state.students);
    }
  }, []);

  useEffect(() => {
    // 1. Initial State Fetch from Server
    fetchServerState().then(initialData => {
      if (initialData) {
        applyServerState(initialData);
      }
    });

    // 2. Connect Live Stream (SSE) for instant cross-device updates
    const cleanupSync = connectLiveSync(
      (updatedState) => {
        applyServerState(updatedState);
        setIsLiveSynced(true);
      },
      (connected) => {
        setIsLiveSynced(connected);
      }
    );

    // 3. Periodic Poll fallback every 5s in case mobile sleeps
    const pollInterval = setInterval(() => {
      fetchServerState().then(data => {
        if (data) {
          applyServerState(data);
        }
      });
    }, 5000);

    return () => {
      cleanupSync();
      clearInterval(pollInterval);
    };
  }, [applyServerState]);

  // Save to LocalStorage for offline cache
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

  // Homework Handlers with individual per-student submission tracking & Real-time Server/Cloud Sync
  const handleToggleHomework = (id: string) => {
    const studentId = currentStudent?.id;
    
    // 1. Optimistic local state update
    const updatedList = homeworkList.map(item => {
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
    });

    setHomeworkList(updatedList);

    // 2. Broadcast change to all devices worldwide
    if (studentId) {
      toggleHomeworkApi(
        id,
        studentId,
        currentStudent?.name,
        currentStudent?.classId,
        currentStudent?.avatarUrl,
        { events, homework: updatedList, posts, students }
      );
    }
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

    // 1. Optimistic update
    const updatedList: HomeworkItem[] = homeworkList.map(item => {
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
          submissionStatus: 'pending_approval' as const,
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
    });

    setHomeworkList(updatedList);

    // 2. Broadcast change to all devices worldwide
    submitHomeworkProofApi(
      homeworkId,
      {
        studentId,
        studentName,
        studentClass,
        studentAvatar,
        proofImageUrl,
        studentNotes,
      },
      { events, homework: updatedList, posts, students }
    );

    showNotification({
      type: 'homework',
      title: 'Homework Proof Submitted',
      message: `Photo proof for "${targetHw?.title || 'Assignment'}" has been submitted for teacher verification.`,
      detail: 'Your teacher will review your submission on their device and approve completion.',
    });
  };

  const handleReviewSubmission = (homeworkId: string, status: 'approved' | 'declined', feedback?: string, studentId?: string) => {
    const currentTimestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const targetHw = homeworkList.find(h => h.id === homeworkId);

    // 1. Optimistic update
    const updatedList: HomeworkItem[] = homeworkList.map(item => {
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
    });

    setHomeworkList(updatedList);

    // 2. Broadcast change to all devices worldwide
    reviewSubmissionApi(
      homeworkId,
      {
        status,
        feedback,
        studentId,
        teacherName: currentTeacher?.name,
      },
      { events, homework: updatedList, posts, students }
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

    const updatedList = [newItem, ...homeworkList];
    setHomeworkList(updatedList);

    // Broadcast change to all devices worldwide
    createHomeworkApi(newHwData, { events, homework: updatedList, posts, students });

    showNotification({
      type: 'homework',
      title: 'Assignment has been placed',
      message: `"${newHwData.title}" has been assigned to ${newHwData.targetClass ? `Class ${newHwData.targetClass}` : 'your tasks'}.`,
      detail: newHwData.dueDate ? `Due date: ${newHwData.dueDate}` : undefined,
    });
  };

  const handleDeleteHomework = (id: string) => {
    const updatedList = homeworkList.filter(item => item.id !== id);
    setHomeworkList(updatedList);
    deleteHomeworkApi(id, { events, homework: updatedList, posts, students });
  };

  // Event Handlers with Real-time Multi-device Sync
  const handleAddEvent = (newEventData: Omit<EventItem, 'id'>) => {
    const newItem: EventItem = {
      ...newEventData,
      id: `ev-${Date.now()}`,
    };
    const updatedEvents = [...events, newItem];
    setEvents(updatedEvents);

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

    const updatedPosts = [eventPostItem, ...posts];
    setPosts(updatedPosts);

    // Broadcast event + auto-generated post to all devices worldwide
    createEventApi(newEventData, true, { events: updatedEvents, homework: homeworkList, posts: updatedPosts, students });

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
      message: `"${newEventData.title}" is now added to the BBS Calendar & Posts feed across all devices.`,
      detail: `${audienceDetail} • Event Date: ${newEventData.date}`,
    });
  };

  const handleDeleteEvent = (id: string) => {
    if (!isTeacherMode) return;
    const deletedItem = events.find(item => item.id === id);
    const updatedEvents = events.filter(item => item.id !== id);
    setEvents(updatedEvents);
    if (selectedEvent?.id === id) {
      setSelectedEvent(null);
    }
    deleteEventApi(id, { events: updatedEvents, homework: homeworkList, posts, students });
    showNotification({
      type: 'event',
      title: 'Event Removed',
      message: deletedItem ? `"${deletedItem.title}" has been deleted from the BBS Calendar.` : 'Event deleted from calendar.',
      detail: 'Updated calendar and schedule overview.',
    });
  };

  // Post Handlers with Multi-Device Sync
  const handleAddPost = (newPostData: Omit<TeacherPost, 'id' | 'likesCount' | 'likedByCurrentUser'>) => {
    const newItem: TeacherPost = {
      ...newPostData,
      id: `post-${Date.now()}`,
      likesCount: 0,
      likedByCurrentUser: false,
    };
    const updatedPosts = [newItem, ...posts];
    setPosts(updatedPosts);

    // Broadcast post to all devices worldwide
    createPostApi(newPostData, { events, homework: homeworkList, posts: updatedPosts, students });

    const targetDesc = newPostData.targetClass && newPostData.targetClass !== 'ALL'
      ? `Class ${newPostData.targetClass}`
      : 'All Classes';

    showNotification({
      type: 'post',
      title: 'Post has been placed',
      message: `"${newPostData.title}" is now published on the student bulletin across all devices.`,
      detail: `Audience: ${targetDesc} • Category: ${newPostData.category.toUpperCase()}`,
    });
  };

  const handleDeletePost = (id: string) => {
    if (!isTeacherMode) return;
    const deletedItem = posts.find(item => item.id === id);
    const updatedPosts = posts.filter(item => item.id !== id);
    setPosts(updatedPosts);
    deletePostApi(id, { events, homework: homeworkList, posts: updatedPosts, students });
    showNotification({
      type: 'post',
      title: 'Post Removed',
      message: deletedItem ? `"${deletedItem.title}" has been deleted.` : 'Bulletin post deleted.',
      detail: 'The bulletin feed has been updated.',
    });
  };

  const handleToggleLike = (postId: string) => {
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        const isLiked = p.likedByCurrentUser;
        return {
          ...p,
          likedByCurrentUser: !isLiked,
          likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
        };
      }
      return p;
    });
    setPosts(updatedPosts);
    togglePostLikeApi(postId, { events, homework: homeworkList, posts: updatedPosts, students });
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
            isLiveSynced={isLiveSynced}
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
