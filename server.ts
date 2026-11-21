import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.7-flash";

// Never fall back to a hardcoded secret: in production a missing secret is a fatal misconfiguration.
let JWT_SECRET = process.env.JWT_SECRET || "";
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL: JWT_SECRET must be set in production.");
    process.exit(1);
  }
  JWT_SECRET = crypto.randomBytes(32).toString("hex");
  console.warn("JWT_SECRET not set - using a random per-process secret (logins reset on restart).");
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "5mb" }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: "Too many attempts, try again later." } });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 15, standardHeaders: true, legacyHeaders: false, message: { error: "AI rate limit reached, please wait a minute." } });

// Initialize Gemini API client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Embedded JSON Document Store (Emulating MongoDB Collections)
const DB_FILE = path.join(process.cwd(), "study_mate_db.json");

interface DatabaseSchema {
  users: Array<{
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    avatar?: string;
    createdAt: string;
  }>;
  subjects: Array<any>;
  tasks: Array<any>;
  notes: Array<any>;
  schedules: Array<any>;
  studyPlans: Array<any>;
  quizzes: Array<any>;
  quizResults: Array<any>;
  studyLogs: Array<any>;
}

const defaultDB: DatabaseSchema = {
  users: [],
  subjects: [],
  tasks: [],
  notes: [],
  schedules: [],
  studyPlans: [],
  quizzes: [],
  quizResults: [],
  studyLogs: [],
};

function readDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), "utf8");
      return defaultDB;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database:", err);
    return defaultDB;
  }
}

function writeDB(data: DatabaseSchema) {
  try {
    const tmp = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tmp, DB_FILE); // atomic replace avoids corrupting the DB on a crash mid-write
  } catch (err) {
    console.error("Error writing database:", err);
  }
}

// ==================== AUTH HELPERS ====================
function generateToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(authHeader?: string): { userId: string; email: string } | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const data = jwt.verify(authHeader.substring(7), JWT_SECRET) as jwt.JwtPayload;
    return { userId: String(data.sub), email: String(data.email) };
  } catch {
    return null;
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = verifyToken(req.headers.authorization);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  (req as any).auth = auth;
  next();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ==================== AUTH ROUTES ====================
app.post("/api/auth/register", authLimiter, (req, res) => {
  const { email, password, name } = req.body;
  if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string" || !email || !password || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Please enter a valid email address" });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
  if (name.length > 80) return res.status(400).json({ error: "Name is too long" });
  const db = readDB();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "User already exists with this email" });
  }
  const newUser = {
    id: `user-${crypto.randomUUID()}`,
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    name,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  writeDB(db);
  const token = generateToken(newUser.id, newUser.email);
  return res.json({
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name, avatar: newUser.avatar },
  });
});

app.post("/api/auth/login", authLimiter, (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return res.status(400).json({ error: "Please provide email and password" });
  }
  const db = readDB();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = generateToken(user.id, user.email);
  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
  });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  const auth = (req as any).auth as { userId: string };
  const db = readDB();
  const user = db.users.find((u) => u.id === auth.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.json({
    user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
  });
});

// ==================== SYNC / DATA ROUTES ====================
// Pull all data for user
app.get("/api/sync/pull", requireAuth, (req, res) => {
  const userId = (req as any).auth.userId as string;
  const db = readDB();

  return res.json({
    subjects: db.subjects.filter((s) => s.userId === userId),
    tasks: db.tasks.filter((t) => t.userId === userId),
    notes: db.notes.filter((n) => n.userId === userId),
    schedules: db.schedules.filter((sc) => sc.userId === userId),
    studyPlans: db.studyPlans.filter((sp) => sp.userId === userId),
    quizzes: db.quizzes.filter((q) => q.userId === userId),
    quizResults: db.quizResults.filter((qr) => qr.userId === userId),
    studyLogs: db.studyLogs.filter((sl) => sl.userId === userId),
    serverTimestamp: new Date().toISOString(),
  });
});

// Push synced data updates from client
app.post("/api/sync/push", requireAuth, (req, res) => {
  const userId = (req as any).auth.userId as string;
  const { subjects, tasks, notes, schedules, studyPlans, quizzes, quizResults, studyLogs } = req.body;

  const db = readDB();

  // Helper to replace or upsert items for this user
  const collections = [
    { key: "subjects", data: subjects },
    { key: "tasks", data: tasks },
    { key: "notes", data: notes },
    { key: "schedules", data: schedules },
    { key: "studyPlans", data: studyPlans },
    { key: "quizzes", data: quizzes },
    { key: "quizResults", data: quizResults },
    { key: "studyLogs", data: studyLogs },
  ] as const;

  for (const col of collections) {
    if (Array.isArray(col.data)) {
      // Retain items of other users, replace this user's collection
      const otherUsersItems = (db[col.key] as any[]).filter((item) => item.userId !== userId);
      const userItems = col.data.map((item) => ({ ...item, userId }));
      (db[col.key] as any[]) = [...otherUsersItems, ...userItems];
    }
  }

  writeDB(db);
  return res.json({ success: true, serverTimestamp: new Date().toISOString() });
});

// ==================== AI FEATURES (GEMINI) ====================

// 1. AI Study Plan Generator
app.post("/api/ai/study-plan", aiLimiter, async (req, res) => {
  try {
    const { subjects, examDate, availableHoursPerDay, preferredStyle, focusAreas, currentLevel } = req.body;

    const prompt = `You are an expert academic tutor and study planner. Generate a highly structured, actionable, and realistic study plan for a student.

Input Details:
- Target Exam Date: ${examDate || "In 4 weeks"}
- Available Study Time: ${availableHoursPerDay || 3} hours/day
- Learning Style: ${preferredStyle || "Mixed (Theory + Practice Quizzes)"}
- Student's Current Readiness / Level: ${currentLevel || "Intermediate"}
- Subjects & Topics to cover: ${JSON.stringify(subjects || [])}
- Special Focus Areas / Weak topics: ${focusAreas || "Core exam topics, formulas, problem solving"}

Output Requirements:
Return a valid JSON object matching this schema:
{
  "title": string,
  "overview": string,
  "strategyTips": string[],
  "dailyTargetHours": number,
  "weeklyMilestones": [
    {
      "weekNumber": number,
      "theme": string,
      "goals": string[]
    }
  ],
  "schedule": [
    {
      "day": string, // e.g. "Day 1 (Mon)", "Day 2 (Tue)"
      "subject": string,
      "topic": string,
      "durationMinutes": number,
      "sessionType": "Theory / Reading" | "Practice Problems" | "Revision & Flashcards" | "Mock Test",
      "actionItems": string[]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (err: any) {
    console.error("AI Study Plan error:", err);
    return res.status(500).json({ error: err.message || "Failed to generate study plan" });
  }
});

// 2. AI Note Summarizer & Concept Extractor
app.post("/api/ai/summarize", aiLimiter, async (req, res) => {
  try {
    const { noteContent, title, subjectName, mode } = req.body;

    if (!noteContent) {
      return res.status(400).json({ error: "Note content is required" });
    }

    const prompt = `You are an academic learning accelerator. Process the student's study notes for subject "${subjectName || "General"}" titled "${title || "Lecture Notes"}".

Mode: ${mode || "full"} (options: "full", "bullet_summary", "cheat_sheet", "key_terms")

Note Content:
"""
${noteContent}
"""

Provide a structured JSON output with:
{
  "summary": string (Markdown formatted comprehensive yet punchy summary),
  "keyConcepts": [
    {
      "term": string,
      "definition": string,
      "importance": "High" | "Medium" | "Crucial"
    }
  ],
  "quickReviewPoints": string[],
  "potentialExamQuestions": string[],
  "formulaOrCheatSheet": string (Markdown formatted quick revision table or formulas, if applicable)
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (err: any) {
    console.error("AI Summarize error:", err);
    return res.status(500).json({ error: err.message || "Failed to summarize note" });
  }
});

// 3. AI Quiz & Flashcard Generator
app.post("/api/ai/quiz", aiLimiter, async (req, res) => {
  try {
    const { subject, topic, noteContent, questionCount, difficulty } = req.body;

    const count = Math.min(Math.max(Number(questionCount) || 5, 3), 15);
    const diff = difficulty || "Medium";

    const prompt = `Generate a high-yield academic revision quiz for students.

Subject: ${subject || "General Academic"}
Topic: ${topic || "Core Concepts"}
Difficulty: ${diff}
Number of Questions: ${count}
${noteContent ? `Source Material / Notes:\n"""\n${noteContent}\n"""` : ""}

Requirements:
- Mix of conceptual understanding, application, and critical definitions.
- Provide 4 distinct options per question.
- Index of correct option (0, 1, 2, or 3).
- Detailed, crystal-clear explanation why the correct answer is right and why others are incorrect.

Return JSON matching:
{
  "quizTitle": string,
  "description": string,
  "difficulty": string,
  "questions": [
    {
      "id": string,
      "question": string,
      "options": string[], // exactly 4 options
      "correctIndex": number, // 0 to 3
      "explanation": string,
      "hint": string
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (err: any) {
    console.error("AI Quiz error:", err);
    return res.status(500).json({ error: err.message || "Failed to generate quiz" });
  }
});

// 4. AI Socratic Tutor / Study Assistant Chat
app.post("/api/ai/tutor", aiLimiter, async (req, res) => {
  try {
    const { message, history, currentSubject, currentTopic } = req.body;

    const systemInstruction = `You are StudyMate AI, an empathetic, brilliant Socratic study companion for college and high school students.
- Explain concepts with clarity, analogies, step-by-step breakdowns, and memorable mnemonics.
- Current active subject: ${currentSubject || "All Subjects"}.
- Current topic: ${currentTopic || "General"}.
- If the student is stuck on a problem, guide them with hints rather than just dumping the final answer immediately, unless they specifically ask for a complete solution.
- Format formulas, code, or structured lists with clean Markdown. Keep responses engaging, supportive, and academically rigorous.`;

    const chatHistory = Array.isArray(history)
      ? history.map((h: any) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content || h.text || "" }],
        }))
      : [];

    const contents = [
      ...chatHistory,
      {
        role: "user",
        parts: [{ text: message || "Hello! Can you help me study?" }],
      },
    ];

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contents as any,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ reply: response.text || "I'm here to help you master this topic! What would you like to explore?" });
  } catch (err: any) {
    console.error("AI Tutor error:", err);
    return res.status(500).json({ error: err.message || "AI Tutor encountered an issue" });
  }
});

// 5. Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "AI StudyMate Backend", timestamp: new Date().toISOString() });
});

// ==================== VITE & STATIC SERVING ====================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI StudyMate server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
