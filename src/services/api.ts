import { EventItem, HomeworkItem, TeacherPost, Student } from '../types';

export interface AppState {
  events: EventItem[];
  homework: HomeworkItem[];
  posts: TeacherPost[];
  students: Student[];
  version: number;
}

const API_BASE = '/api';

/**
 * Fetch the latest shared state from the server
 */
export async function fetchServerState(): Promise<AppState | null> {
  try {
    const res = await fetch(`${API_BASE}/state`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('[Sync] Failed to fetch server state:', err);
    return null;
  }
}

/**
 * Connect to real-time Server-Sent Events (SSE) stream for instant multi-device updates
 */
export function connectLiveSync(
  onUpdate: (state: AppState) => void,
  onConnectionChange?: (connected: boolean) => void
): () => void {
  let eventSource: EventSource | null = null;
  let reconnectTimeout: any = null;
  let isClosed = false;

  function connect() {
    if (isClosed) return;

    try {
      eventSource = new EventSource(`${API_BASE}/live-sync`);

      eventSource.onopen = () => {
        if (onConnectionChange) onConnectionChange(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'init' || payload.type === 'sync') {
            if (payload.data) {
              onUpdate(payload.data);
            }
          }
        } catch (e) {
          console.warn('[Sync] SSE parse error:', e);
        }
      };

      eventSource.onerror = () => {
        if (onConnectionChange) onConnectionChange(false);
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (!isClosed) {
          // Reconnect with exponential backoff
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };
    } catch (e) {
      console.warn('[Sync] EventSource creation failed:', e);
      if (!isClosed) {
        reconnectTimeout = setTimeout(connect, 4000);
      }
    }
  }

  connect();

  // Return cleanup function
  return () => {
    isClosed = true;
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}

// ---------------- API Mutations for Real-time Multi-device Sync ----------------

export async function createEventApi(eventData: Omit<EventItem, 'id'>, autoCreatePost?: boolean): Promise<{ event: EventItem; post?: TeacherPost } | null> {
  try {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventData, autoCreatePost }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Sync] createEventApi failed:', err);
    return null;
  }
}

export async function deleteEventApi(eventId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}`, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.warn('[Sync] deleteEventApi failed:', err);
    return false;
  }
}

export async function createHomeworkApi(hwData: Omit<HomeworkItem, 'id' | 'completed'>): Promise<HomeworkItem | null> {
  try {
    const res = await fetch(`${API_BASE}/homework`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hwData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Sync] createHomeworkApi failed:', err);
    return null;
  }
}

export async function deleteHomeworkApi(homeworkId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/homework/${homeworkId}`, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.warn('[Sync] deleteHomeworkApi failed:', err);
    return false;
  }
}

export async function toggleHomeworkApi(homeworkId: string, studentId: string, currentStudentName?: string, currentStudentClass?: string, currentStudentAvatar?: string): Promise<HomeworkItem | null> {
  try {
    const res = await fetch(`${API_BASE}/homework/${homeworkId}/toggle`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, studentName: currentStudentName, studentClass: currentStudentClass, studentAvatar: currentStudentAvatar }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Sync] toggleHomeworkApi failed:', err);
    return null;
  }
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
  }
): Promise<HomeworkItem | null> {
  try {
    const res = await fetch(`${API_BASE}/homework/${homeworkId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Sync] submitHomeworkProofApi failed:', err);
    return null;
  }
}

export async function reviewSubmissionApi(
  homeworkId: string,
  review: {
    status: 'approved' | 'declined';
    feedback?: string;
    studentId?: string;
    teacherName?: string;
  }
): Promise<HomeworkItem | null> {
  try {
    const res = await fetch(`${API_BASE}/homework/${homeworkId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Sync] reviewSubmissionApi failed:', err);
    return null;
  }
}

export async function createPostApi(postData: Omit<TeacherPost, 'id' | 'likesCount' | 'likedByCurrentUser'>): Promise<TeacherPost | null> {
  try {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Sync] createPostApi failed:', err);
    return null;
  }
}

export async function deletePostApi(postId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}`, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.warn('[Sync] deletePostApi failed:', err);
    return false;
  }
}

export async function togglePostLikeApi(postId: string): Promise<{ likesCount: number } | null> {
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Sync] togglePostLikeApi failed:', err);
    return null;
  }
}

export async function updateStudentApi(student: Student): Promise<Student | null> {
  try {
    const res = await fetch(`${API_BASE}/students/${student.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Sync] updateStudentApi failed:', err);
    return null;
  }
}

export async function resetServerDataApi(): Promise<AppState | null> {
  try {
    const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Sync] resetServerDataApi failed:', err);
    return null;
  }
}
