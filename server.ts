import express, { Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { INITIAL_EVENTS, INITIAL_HOMEWORK, INITIAL_POSTS, INITIAL_STUDENTS, TEACHERS } from "./src/mockData";
import { EventItem, HomeworkItem, TeacherPost, Student, StudentSubmission } from "./src/types";

// Persistent Database Storage File Path
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "bbs_database.json");

interface SchoolDatabase {
  events: EventItem[];
  homework: HomeworkItem[];
  posts: TeacherPost[];
  students: Student[];
  version: number;
  lastUpdated: string;
}

// In-Memory Global State with File Persistence
let dbState: SchoolDatabase = {
  events: INITIAL_EVENTS,
  homework: INITIAL_HOMEWORK,
  posts: INITIAL_POSTS,
  students: INITIAL_STUDENTS,
  version: 1,
  lastUpdated: new Date().toISOString(),
};

// Initialize or Load Database from Disk
function initializeDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const rawData = fs.readFileSync(DB_FILE, "utf-8");
      const loaded: Partial<SchoolDatabase> = JSON.parse(rawData);
      dbState = {
        events: Array.isArray(loaded.events) && loaded.events.length > 0 ? loaded.events : INITIAL_EVENTS,
        homework: Array.isArray(loaded.homework) && loaded.homework.length > 0 ? loaded.homework : INITIAL_HOMEWORK,
        posts: Array.isArray(loaded.posts) && loaded.posts.length > 0 ? loaded.posts : INITIAL_POSTS,
        students: Array.isArray(loaded.students) && loaded.students.length > 0 ? loaded.students : INITIAL_STUDENTS,
        version: loaded.version || 1,
        lastUpdated: loaded.lastUpdated || new Date().toISOString(),
      };
      console.log(`[Database] Loaded existing database from ${DB_FILE} (Version: ${dbState.version})`);
    } else {
      saveDatabase();
      console.log(`[Database] Initialized new database at ${DB_FILE}`);
    }
  } catch (err) {
    console.warn("[Database] Failed to load database from disk, using initial seeds:", err);
  }
}

// Save Database to Disk
function saveDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Database] Failed to save database to disk:", err);
  }
}

// Active Server-Sent Events (SSE) Client Connections
const sseClients = new Set<Response>();

function broadcastSync(type: string = "sync") {
  dbState.version += 1;
  dbState.lastUpdated = new Date().toISOString();
  saveDatabase();

  const payload = JSON.stringify({
    type,
    version: dbState.version,
    lastUpdated: dbState.lastUpdated,
    data: {
      events: dbState.events,
      homework: dbState.homework,
      posts: dbState.posts,
      students: dbState.students,
      version: dbState.version,
    },
  });

  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  initializeDatabase();

  const app = express();
  const PORT = 3000;

  // High payload limits for rich image proofs and event photos
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // ----------------- Real-time Multi-Device Sync Endpoints -----------------

  // 1. Full State Snapshot
  app.get("/api/state", (_req, res) => {
    res.json({
      events: dbState.events,
      homework: dbState.homework,
      posts: dbState.posts,
      students: dbState.students,
      version: dbState.version,
      lastUpdated: dbState.lastUpdated,
    });
  });

  // 2. Server-Sent Events (SSE) Live Stream for all connected devices
  app.get("/api/live-sync", (req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    res.write(
      `data: ${JSON.stringify({
        type: "init",
        version: dbState.version,
        data: {
          events: dbState.events,
          homework: dbState.homework,
          posts: dbState.posts,
          students: dbState.students,
          version: dbState.version,
        },
      })}\n\n`
    );

    sseClients.add(res);

    // Heartbeat every 25 seconds to keep proxy connection alive
    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 25000);

    req.on("close", () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  // 3. Calendar Events Endpoints
  app.post("/api/events", (req, res) => {
    const { event, autoCreatePost } = req.body;
    if (!event || !event.title) {
      return res.status(400).json({ error: "Invalid event data" });
    }

    const newEvent: EventItem = {
      ...event,
      id: event.id || `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    dbState.events = [newEvent, ...dbState.events];

    let createdPost: TeacherPost | undefined;
    if (autoCreatePost !== false) {
      const counselorName = newEvent.counselors?.[0] || "Faculty Advisor";
      const counselorObj = TEACHERS.find((t) => t.name === counselorName);

      const eventDateFormatted = (() => {
        try {
          if (newEvent.date) {
            const [y, m, d] = newEvent.date.split("-").map(Number);
            const dt = new Date(y, m - 1, d);
            return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          }
          return "Upcoming Event";
        } catch {
          return newEvent.date;
        }
      })();

      const scheduleDetails: string[] = [`📅 Event Date: ${eventDateFormatted}`];
      if (newEvent.startTime) {
        scheduleDetails.push(`⏰ Time: ${newEvent.startTime}${newEvent.endTime ? ` - ${newEvent.endTime}` : ""}`);
      }
      if (newEvent.location) {
        scheduleDetails.push(`📍 Location: ${newEvent.location}`);
      }

      createdPost = {
        id: `post-ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        teacherName: counselorObj?.name || counselorName,
        teacherRole: counselorObj?.role || "Event Coordinator & Faculty Counselor",
        teacherAvatar: counselorObj?.avatarUrl,
        title: `${newEvent.title}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        category: "event",
        fullMessage: `${scheduleDetails.join(" • ")}\n\n${newEvent.details || ""}`,
        imageUrl: newEvent.imageUrl,
        targetClass: newEvent.targetAudience === "ALL" ? "ALL" : newEvent.targetClass,
        targetStudentIds: newEvent.targetStudentIds,
        likesCount: 0,
        likedByCurrentUser: false,
      };

      dbState.posts = [createdPost, ...dbState.posts];
    }

    broadcastSync("event_added");
    res.json({ event: newEvent, post: createdPost });
  });

  app.delete("/api/events/:id", (req, res) => {
    const { id } = req.params;
    dbState.events = dbState.events.filter((e) => e.id !== id);
    broadcastSync("event_deleted");
    res.json({ success: true, id });
  });

  // 4. Homework Assignments Endpoints
  app.post("/api/homework", (req, res) => {
    const hwData = req.body;
    if (!hwData || !hwData.title) {
      return res.status(400).json({ error: "Invalid homework data" });
    }

    const newHw: HomeworkItem = {
      ...hwData,
      id: hwData.id || `hw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      completed: false,
      submissions: hwData.submissions || {},
    };

    dbState.homework = [newHw, ...dbState.homework];
    broadcastSync("homework_added");
    res.json(newHw);
  });

  app.delete("/api/homework/:id", (req, res) => {
    const { id } = req.params;
    dbState.homework = dbState.homework.filter((h) => h.id !== id);
    broadcastSync("homework_deleted");
    res.json({ success: true, id });
  });

  app.put("/api/homework/:id/toggle", (req, res) => {
    const { id } = req.params;
    const { studentId, studentName, studentClass, studentAvatar } = req.body;

    const hw = dbState.homework.find((h) => h.id === id);
    if (!hw) return res.status(404).json({ error: "Homework not found" });

    if (!studentId) {
      hw.completed = !hw.completed;
    } else {
      const existingSub = hw.submissions?.[studentId];
      const newCompleted = existingSub ? !existingSub.completed : !hw.completed;

      const updatedSub: StudentSubmission = {
        studentId,
        studentName: studentName || existingSub?.studentName || "Student",
        studentClass: studentClass || existingSub?.studentClass || hw.targetClass,
        studentAvatar: studentAvatar || existingSub?.studentAvatar,
        submissionStatus: newCompleted ? "approved" : "not_submitted",
        completed: newCompleted,
        proofImageUrl: existingSub?.proofImageUrl,
        studentNotes: existingSub?.studentNotes,
        submittedAt: existingSub?.submittedAt,
        teacherFeedback: existingSub?.teacherFeedback,
        reviewedByTeacherName: existingSub?.reviewedByTeacherName,
        reviewedAt: existingSub?.reviewedAt,
      };

      hw.submissions = {
        ...(hw.submissions || {}),
        [studentId]: updatedSub,
      };

      if (hw.targetAudience === "SINGLE_STUDENT" || hw.studentId === studentId) {
        hw.completed = newCompleted;
      }
    }

    broadcastSync("homework_toggled");
    res.json(hw);
  });

  app.post("/api/homework/:id/submit", (req, res) => {
    const { id } = req.params;
    const { studentId, studentName, studentClass, studentAvatar, proofImageUrl, studentNotes } = req.body;

    const hw = dbState.homework.find((h) => h.id === id);
    if (!hw) return res.status(404).json({ error: "Homework not found" });

    const currentTimestamp =
      new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " • " +
      new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const sId = studentId || "s-101";
    const sName = studentName || "Nicholas Tan";
    const sClass = studentClass || hw.targetClass || "JC1-A";

    const newSub: StudentSubmission = {
      studentId: sId,
      studentName: sName,
      studentClass: sClass,
      studentAvatar,
      submissionStatus: "pending_approval",
      completed: false,
      proofImageUrl,
      studentNotes: studentNotes || undefined,
      submittedAt: currentTimestamp,
    };

    hw.submissions = {
      ...(hw.submissions || {}),
      [sId]: newSub,
    };

    // Keep primary legacy fields aligned for single-student assignments
    if (hw.targetAudience === "SINGLE_STUDENT" || hw.studentId === sId || !hw.submittedByStudentId || hw.submittedByStudentId === sId) {
      hw.submissionStatus = "pending_approval";
      hw.completed = false;
      hw.proofImageUrl = proofImageUrl;
      hw.studentNotes = studentNotes || undefined;
      hw.submittedAt = currentTimestamp;
      hw.submittedByStudentId = sId;
      hw.submittedByStudentName = sName;
      hw.submittedByStudentClass = sClass;
      hw.submittedByStudentAvatar = studentAvatar;
    }

    broadcastSync("homework_submitted");
    res.json(hw);
  });

  app.post("/api/homework/:id/review", (req, res) => {
    const { id } = req.params;
    const { status, feedback, studentId, teacherName } = req.body;

    const hw = dbState.homework.find((h) => h.id === id);
    if (!hw) return res.status(404).json({ error: "Homework not found" });

    const currentTimestamp =
      new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " • " +
      new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const newSubs = { ...(hw.submissions || {}) };
    const targetStudentId = studentId || hw.submittedByStudentId || Object.keys(newSubs)[0];

    if (targetStudentId && newSubs[targetStudentId]) {
      newSubs[targetStudentId] = {
        ...newSubs[targetStudentId],
        submissionStatus: status,
        completed: status === "approved",
        teacherFeedback: feedback || (status === "approved" ? "Verified and approved by faculty." : "Revision requested."),
        reviewedByTeacherName: teacherName || "Faculty Counselor",
        reviewedAt: currentTimestamp,
      };
      hw.submissions = newSubs;
    }

    if (targetStudentId === hw.submittedByStudentId || !hw.submittedByStudentId) {
      hw.submissionStatus = status;
      hw.completed = status === "approved";
      hw.teacherFeedback = feedback || (status === "approved" ? "Verified and approved by faculty." : "Revision requested.");
      hw.reviewedByTeacherName = teacherName || "Faculty Counselor";
      hw.reviewedAt = currentTimestamp;
    }

    broadcastSync("homework_reviewed");
    res.json(hw);
  });

  // 5. Teacher Posts / Bulletins Endpoints
  app.post("/api/posts", (req, res) => {
    const postData = req.body;
    if (!postData || !postData.title) {
      return res.status(400).json({ error: "Invalid post data" });
    }

    const newPost: TeacherPost = {
      ...postData,
      id: postData.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      likesCount: 0,
      likedByCurrentUser: false,
    };

    dbState.posts = [newPost, ...dbState.posts];
    broadcastSync("post_added");
    res.json(newPost);
  });

  app.delete("/api/posts/:id", (req, res) => {
    const { id } = req.params;
    dbState.posts = dbState.posts.filter((p) => p.id !== id);
    broadcastSync("post_deleted");
    res.json({ success: true, id });
  });

  app.post("/api/posts/:id/like", (req, res) => {
    const { id } = req.params;
    const post = dbState.posts.find((p) => p.id === id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.likedByCurrentUser = !post.likedByCurrentUser;
    post.likesCount = post.likedByCurrentUser ? post.likesCount + 1 : Math.max(0, post.likesCount - 1);

    broadcastSync("post_liked");
    res.json({ likesCount: post.likesCount, likedByCurrentUser: post.likedByCurrentUser });
  });

  // 6. Student Profile Updates
  app.put("/api/students/:id", (req, res) => {
    const { id } = req.params;
    const studentData = req.body;

    const idx = dbState.students.findIndex((s) => s.id === id);
    if (idx !== -1) {
      dbState.students[idx] = { ...dbState.students[idx], ...studentData };
    } else {
      dbState.students.push(studentData);
    }

    broadcastSync("student_updated");
    res.json(dbState.students[idx !== -1 ? idx : dbState.students.length - 1]);
  });

  // 7. Reset to Initial BBS Dataset
  app.post("/api/reset", (_req, res) => {
    dbState = {
      events: INITIAL_EVENTS,
      homework: INITIAL_HOMEWORK,
      posts: INITIAL_POSTS,
      students: INITIAL_STUDENTS,
      version: dbState.version + 1,
      lastUpdated: new Date().toISOString(),
    };
    saveDatabase();
    broadcastSync("database_reset");
    res.json(dbState);
  });

  // 8. Gemini AI Assistant Endpoint
  app.post("/api/ai/generate-details", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is not set. Please set the GEMINI_API_KEY environment variable in Settings > Secrets.",
        });
      }

      const { prompt, title, category, targetAudience, currentText, contextType } = req.body;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = `You are an academic writing assistant for faculty and teachers at Bina Bangsa School (BBS).
Your task is to help teachers compose, enrich, polish, or summarize clear, professional, and well-structured details for school events, announcements, bulletins, and assignments.
Maintain an encouraging, concise, academic tone. Format cleanly with bullet points or short paragraphs when helpful.
Return only the generated content without extra meta-commentary.`;

      const userPrompt = `Context: Drafting ${contextType || "school event or announcement details"} for Bina Bangsa School.
Title: ${title || "Untitled"}
Category: ${category || "General"}
Target Audience: ${targetAudience || "All Students"}
Current Draft/Notes: ${currentText || "(None)"}
User Request: ${prompt || "Write engaging and comprehensive details for this entry, including purpose, expectations, and necessary instructions."}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
        },
      });

      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("AI details generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate details with AI." });
    }
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", version: dbState.version, clientsCount: sseClients.size });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
