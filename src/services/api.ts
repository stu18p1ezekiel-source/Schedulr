import { EventItem, HomeworkItem, TeacherPost, Student, StudentSubmission } from '../types';
import {
  AppState,
  initCloudSync,
  broadcastStateChange,
  fetchCloudSnapshot,
} from './cloudSync';

export type { AppState };

const API_BASE = '/api';

/**
 * Fetch the latest shared state from the server or cloud snapshot
 */
export async function fetchServerState(): Promise<AppState | null> {
  // 1. Try local server first if available
  try {
    const res = await fetch(`${API_BASE}/state`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.events)) {
        return data;
      }
    }
  } catch (err) {
    // Expected on static hosting like Vercel
  }

  // 2. Fetch from Universal Cloud Snapshot KV
  try {
    const cloudData = await fetchCloudSnapshot();
    if (cloudData) {
      return cloudData;
    }
  } catch (err) {
    console.warn('[Sync] Cloud snapshot fetch failed:', err);
  }

  return null;
}

/**
 * Connect to real-time synchronization streams (combines MQTT WebSockets for Vercel/mobile & SSE for Node)
 */
export function connectLiveSync(
  onUpdate: (state: AppState) => void,
  onConnectionChange?: (connected: boolean) => void
): () => void {
  // 1. Universal Cloud MQTT WebSocket Sync (Works globally on Vercel, iOS, Android, PC)
  const cleanupCloud = initCloudSync(onUpdate, onConnectionChange);

  // 2. Local Node SSE Stream (if running with custom server)
  let eventSource: EventSource | null = null;
  let isClosed = false;

  try {
    eventSource = new EventSource(`${API_BASE}/live-sync`);
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'init' || payload.type === 'sync') {
          if (payload.data) {
            onUpdate(payload.data);
          }
        }
      } catch (e) {}
    };
  } catch (e) {
    // SSE not supported on static hostings like Vercel (MQTT handles it)
  }

  return () => {
    isClosed = true;
    cleanupCloud();
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}

// ---------------- Helpers to Broadcast Current State ----------------

export function syncStateGlobally(
  events: EventItem[],
  homework: HomeworkItem[],
  posts: TeacherPost[],
  students: Student[]
) {
  broadcastStateChange({
    events,
    homework,
    posts,
    students,
    version: Date.now(),
  });
}

// ---------------- API Mutations with Universal Cloud & Server Sync ----------------

export async function createEventApi(
  eventData: Omit<EventItem, 'id'>,
  autoCreatePost?: boolean,
  currentFullState?: { events: EventItem[]; homework: HomeworkItem[]; posts: TeacherPost[]; students: Student[] }
): Promise<{ event: EventItem; post?: TeacherPost } | null> {
  // 1. Send to local Node server if online
  try {
    fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventData, autoCreatePost }),
    }).catch(() => {});
  } catch {}

  // 2. Broadcast via Universal Cloud Sync
  if (currentFullState) {
    syncStateGlobally(
      currentFullState.events,
      currentFullState.homework,
      currentFullState.posts,
      currentFullState.students
    );
  }

  return null;
}

export async function deleteEventApi(
  eventId: string,
  currentFullState?: { events: EventItem[]; homework: HomeworkItem[]; posts: TeacherPost[]; students: Student[] }
): Promise<boolean> {
  try {
    fetch(`${API_BASE}/events/${eventId}`, { method: 'DELETE' }).catch(() => {});
  } catch {}

  if (currentFullState) {
    syncStateGlobally(
      currentFullState.events,
      currentFullState.homework,
      currentFullState.posts,
      currentFullState.students
    );
  }
  return true;
}

export async function createHomeworkApi(
  hwData: Omit<HomeworkItem, 'id' | 'completed'>,
  currentFullState?: { events: EventItem[]; homework: HomeworkItem[]; posts: TeacherPost[]; students: Student[] }
): Promise<HomeworkItem | null> {
  try {
    fetch(`${API_BASE}/homework`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hwData),
    }).catch(() => {});
  } catch {}

  if (currentFullState) {
    syncStateGlobally(
      currentFullState.events,
      currentFullState.homework,
      currentFullState.posts,
      currentFullState.students
    );
  }

  return null;
}

export async function deleteHomeworkApi(
  homeworkId: string,
  currentFullState?: { events: EventItem[]; homework: HomeworkItem[]; posts: TeacherPost[]; students: Student[] }
): Promise<boolean> {
  try {
    fetch(`${API_BASE}/homework/${homeworkId}`, { method: 'DELETE' }).catch(() => {});
  } catch {}

  if (currentFullState) {
    syncStateGlobally(
      currentFullState.events,
      currentFullState.homework,
      currentFullState.posts,
      currentFullState.students
    );
  }
  return true;
}

export async function toggleHomeworkApi(
  homeworkId: string,
  studentId: string,
  currentStudentName?: string,
  currentStudentClass?: string,
  currentStudentAvatar?: string,
  currentFullState?: { events: EventItem[]; homework: HomeworkItem[]; posts: TeacherPost[]; students: Student[] }
): Promise<HomeworkItem | null> {
  try {
    fetch(`${API_BASE}/homework/${homeworkId}/toggle`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, studentName: currentStudentName, studentClass: currentStudentClass, studentAvatar: currentStudentAvatar }),
    }).catch(() => {});
  } catch {}

  if (currentFullState) {
    syncStateGlobally(
      currentFullState.events,
      currentFullState.homework,
      currentFullState.posts,
      currentFullState.students
    );
  }
  return null;
}

export async function submitHomeworkProofApi(
  homeworkId: string,
  submission: {
    studentId: string;
    studentName: string;
    studentClass?: string;
    studentAvatar?: string;
    proofImageUrl: string;
    studentNotes?: string;
  },
  currentFullState?: { events: EventItem[]; homework: HomeworkItem[]; posts: TeacherPost[]; students: Student[] }
): Promise<HomeworkItem | null> {
  try {
    fetch(`${API_BASE}/homework/${homeworkId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    }).catch(() => {});
  } catch {}

  if (currentFullState) {
    syncStateGlobally(
      currentFullState.events,
      currentFullState.homework,
      currentFullState.posts,
      currentFullState.students
    );
  }
  return null;
}

export async function reviewSubmissionApi(
  homeworkId: string,
  review: {
    status: 'approved' | 'declined';
    feedback?: string;
    studentId?: string;
    teacherName?: string;
  },
  currentFullState?: { events: EventItem[]; homework: HomeworkItem[]; posts: TeacherPost[]; students: Student[] }
): Promise<HomeworkItem | null> {
  try {
    fetch(`${API_BASE}/homework/${homeworkId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    }).catch(() => {});
  } catch {}

  if (currentFullState) {
    syncStateGlobally(
      currentFullState.events,
      currentFullState.homework,
      currentFullState.posts,
      currentFullState.students
    );
  }
  return null;
}

export async function createPostApi(
  postData: Omit<TeacherPost, 'id' | 'likesCount' | 'likedByCurrentUser'>,
  currentFullState?: { events: EventItem[]; homework: HomeworkItem[]; posts: TeacherPost[]; students: Student[] }
): Promise<TeacherPost | null> {
  try {
    fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    }).catch(() => {});
  } catch {}

  if (currentFullState) {
    syncStateGlobally(
      currentFullState.events,
      currentFullState.homework,
      currentFullState.posts,
      currentFullState.students
    );
  }
  return null;
}

export async function deletePostApi(
  postId: string,
  currentFullState?: { events: EventItem[]; homework: HomeworkItem[]; posts: TeacherPost[]; students: Student[] }
): Promise<boolean> {
  try {
    fetch(`${API_BASE}/posts/${postId}`, { method: 'DELETE' }).catch(() => {});
  } catch {}

  if (currentFullState) {
    syncStateGlobally(
      currentFullState.events,
      currentFullState.homework,
      currentFullState.posts,
      currentFullState.students
    );
  }
  return true;
}

export async function togglePostLikeApi(
  postId: string,
  currentFullState?: { events: EventItem[]; homework: HomeworkItem[]; posts: TeacherPost[]; students: Student[] }
): Promise<{ likesCount: number } | null> {
  try {
    fetch(`${API_BASE}/posts/${postId}/like`, { method: 'POST' }).catch(() => {});
  } catch {}

  if (currentFullState) {
    syncStateGlobally(
      currentFullState.events,
      currentFullState.homework,
      currentFullState.posts,
      currentFullState.students
    );
  }
  return null;
}

export async function updateStudentApi(
  student: Student,
  currentFullState?: { events: EventItem[]; homework: HomeworkItem[]; posts: TeacherPost[]; students: Student[] }
): Promise<Student | null> {
  try {
    fetch(`${API_BASE}/students/${student.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    }).catch(() => {});
  } catch {}

  if (currentFullState) {
    syncStateGlobally(
      currentFullState.events,
      currentFullState.homework,
      currentFullState.posts,
      currentFullState.students
    );
  }
  return null;
}

export async function resetServerDataApi(): Promise<AppState | null> {
  try {
    fetch(`${API_BASE}/reset`, { method: 'POST' }).catch(() => {});
  } catch {}
  return null;
}
