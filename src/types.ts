export interface Student {
  id: string;
  name: string;
  classId: string;
  avatarUrl?: string;
  email?: string;
  rollNumber?: string;
}

export interface Teacher {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarUrl?: string;
}

export type TargetAudience = 'ALL' | 'CLASS' | 'GROUP_STUDENTS' | 'SINGLE_STUDENT' | 'SPECIFIC_STUDENTS';

export interface EventItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  details: string;
  counselors: string[];
  imageUrl?: string;
  targetAudience: TargetAudience;
  targetClass?: string;
  targetStudentIds?: string[];
  category: 'academic' | 'sports' | 'arts' | 'deadline' | 'workshop' | 'general';
  location?: string;
  color?: string;
}

export type SubmissionStatus = 'not_submitted' | 'pending_approval' | 'approved' | 'declined';

export interface StudentSubmission {
  studentId: string;
  studentName: string;
  studentClass?: string;
  studentAvatar?: string;
  submissionStatus: SubmissionStatus;
  completed: boolean;
  proofImageUrl?: string;
  studentNotes?: string;
  submittedAt?: string;
  teacherFeedback?: string;
  reviewedByTeacherName?: string;
  reviewedAt?: string;
}

export interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string;
  description?: string;
  completed: boolean;
  targetAudience: TargetAudience;
  targetClass?: string;
  targetStudentIds?: string[];
  studentId?: string; // If student created for themselves
  assignedBy?: string;
  priority: 'low' | 'medium' | 'high';

  // Per-student submissions store (Key: studentId)
  submissions?: Record<string, StudentSubmission>;

  // Submission & Photo Proof Verification (Active Student / Legacy context)
  submissionStatus?: SubmissionStatus;
  proofImageUrl?: string;
  submittedAt?: string;
  submittedByStudentId?: string;
  submittedByStudentName?: string;
  submittedByStudentClass?: string;
  submittedByStudentAvatar?: string;
  studentNotes?: string;
  teacherFeedback?: string;
  reviewedByTeacherName?: string;
  reviewedAt?: string;
}

export interface TeacherPost {
  id: string;
  teacherName: string;
  teacherRole: string;
  teacherAvatar?: string;
  title: string;
  date: string;
  fullMessage: string;
  imageUrl?: string;
  category: 'announcement' | 'reminder' | 'event' | 'deadline';
  targetClass?: string; // 'ALL' or specific class
  targetStudentIds?: string[];
  likesCount: number;
  likedByCurrentUser?: boolean;
  priorityNotice?: boolean;
}

export type ActiveTab = 'home' | 'calendar' | 'homework' | 'posts' | 'profile' | 'admin';
