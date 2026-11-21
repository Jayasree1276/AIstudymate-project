import { Subject, Task, Note, StudySchedule, StudyPlan, Quiz, QuizResult, StudyLog, StudySession, User, UserProfile, SyncStatus } from '../types';
import { INITIAL_SUBJECTS, INITIAL_TASKS, INITIAL_NOTES, INITIAL_SCHEDULES, INITIAL_QUIZZES, INITIAL_STUDY_LOGS, INITIAL_QUIZ_RESULTS } from './initialData';

const TOKEN_KEY = 'ai_studymate_jwt_token';
const USER_KEY = 'ai_studymate_user';
const STORAGE_PREFIX = 'ai_studymate_data_';
const OFFLINE_TOKENS = ['demo-offline-token', 'offline-jwt-token'];

// Thrown when the server explicitly rejects credentials (as opposed to being unreachable).
class AuthError extends Error {}

function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

export class StudyMateAPI {
  private static instance: StudyMateAPI;
  private syncListeners: Array<(status: SyncStatus) => void> = [];
  private currentSyncStatus: SyncStatus = typeof navigator !== 'undefined' && navigator.onLine ? 'online-synced' : 'offline';
  private syncTimer: NodeJS.Timeout | null = null;
  private broadcastChannel: BroadcastChannel | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));

      try {
        this.broadcastChannel = new BroadcastChannel('studymate_sync_channel');
        this.broadcastChannel.onmessage = (msg) => {
          if (msg.data && msg.data.type === 'SYNC_REFRESH') {
            this.notifySyncListeners();
          }
        };
      } catch (e) {
        // BroadcastChannel fallback
      }


      if (navigator.onLine) {
        setTimeout(() => this.syncWithServer(), 1500);
      }
    }
  }

  public static getInstance(): StudyMateAPI {
    if (!StudyMateAPI.instance) {
      StudyMateAPI.instance = new StudyMateAPI();
    }
    return StudyMateAPI.instance;
  }

  public onSyncStatusChange(callback: (status: SyncStatus) => void) {
    this.syncListeners.push(callback);
    callback(this.currentSyncStatus);
    return () => {
      this.syncListeners = this.syncListeners.filter((cb) => cb !== callback);
    };
  }

  public getSyncStatus(): SyncStatus {
    return this.currentSyncStatus;
  }

  private setSyncStatus(status: SyncStatus) {
    this.currentSyncStatus = status;
    this.syncListeners.forEach((cb) => cb(status));
  }

  private handleNetworkChange(isOnline: boolean) {
    if (isOnline) {
      this.setSyncStatus('syncing');
      this.syncWithServer();
    } else {
      this.setSyncStatus('offline');
    }
  }

  public triggerBroadcast() {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'SYNC_REFRESH', timestamp: Date.now() });
    }
  }

  private notifySyncListeners() {
    this.syncListeners.forEach((cb) => cb(this.currentSyncStatus));
  }

  // ==================== AGGREGATED DATA GETTER ====================
  public getData() {
    return {
      subjects: this.getSubjects(),
      tasks: this.getTasks(),
      notes: this.getNotes(),
      studyPlans: this.getStudyPlans(),
      quizzes: this.getQuizzes(),
      quizResults: this.getQuizResults(),
      studySchedules: this.getSchedules(),
      studySessions: this.getStudyLogs(),
    };
  }

  // ==================== AUTHENTICATION ====================
  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public getUser(): UserProfile | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public getCurrentUser(): UserProfile | null {
    return this.getUser();
  }

  public async login(email: string, password: string): Promise<UserProfile> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new AuthError(data.error || 'Login failed');
      this.clearLocalData(); // discard whatever was cached before; the account's own data comes from the server
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      await this.pullFromServer();
      return data.user;
    } catch (err: any) {
      // Wrong credentials must never log the user in; only fall back when the server is unreachable.
      if (err instanceof AuthError) throw err;
      // Demo / offline fallback
      const demoUser: UserProfile = {
        id: 'demo-user-1',
        email: email || 'student@studymate.edu',
        name: email.includes('@') ? email.split('@')[0] : 'Alex Morgan',
        academicGoal: 'Maintain 3.8+ GPA & Ace Finals',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
      localStorage.setItem(TOKEN_KEY, 'demo-offline-token');
      localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
      return demoUser;
    }
  }

  public async register(email: string, name: string, password: string, academicGoal?: string): Promise<UserProfile> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new AuthError(data.error || 'Registration failed');
      const fullUser: UserProfile = { ...data.user, academicGoal };
      this.clearLocalData(); // a brand-new account always starts empty (never inherits leftover browser data)
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(fullUser));
      await this.syncWithServer();
      return fullUser;
    } catch (err: any) {
      if (err instanceof AuthError) throw err;
      const offlineUser: UserProfile = {
        id: `user-${Date.now()}`,
        email,
        name,
        academicGoal: academicGoal || 'Excel in Academic Studies',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      };
      localStorage.setItem(TOKEN_KEY, 'offline-jwt-token');
      localStorage.setItem(USER_KEY, JSON.stringify(offlineUser));
      return offlineUser;
    }
  }

  // Remove every locally cached study record so the next user starts with a clean workspace.
  public clearLocalData() {
    ['subjects', 'tasks', 'notes', 'schedules', 'quizzes', 'quizResults', 'studyLogs', 'studyPlans'].forEach((k) =>
      localStorage.removeItem(STORAGE_PREFIX + k)
    );
  }

  public logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.clearLocalData(); // prevents the next person on this browser from seeing (or syncing) this user's data
    this.triggerBroadcast();
  }

  // Explicit, opt-in demo: loads sample data into a local-only session (nothing is sent to the server).
  public loginAsDemo(): UserProfile {
    this.clearLocalData();
    setLocalItem('subjects', INITIAL_SUBJECTS);
    setLocalItem('tasks', INITIAL_TASKS);
    setLocalItem('notes', INITIAL_NOTES);
    setLocalItem('schedules', INITIAL_SCHEDULES);
    setLocalItem('quizzes', INITIAL_QUIZZES);
    setLocalItem('studyLogs', INITIAL_STUDY_LOGS);
    setLocalItem('quizResults', INITIAL_QUIZ_RESULTS);
    setLocalItem('studyPlans', []);
    const demoUser: UserProfile = {
      id: 'demo-user-1',
      email: 'demo@studymate.app',
      name: 'Demo Student',
      academicGoal: 'Explore AI StudyMate with sample data',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Demo',
    };
    localStorage.setItem(TOKEN_KEY, 'demo-offline-token');
    localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
    this.triggerBroadcast();
    return demoUser;
  }

  // ==================== SYNC ENGINE ====================
  // Replace local cache with the signed-in user's server data (used right after login).
  private async pullFromServer(): Promise<void> {
    const token = this.getToken();
    if (!token || OFFLINE_TOKENS.includes(token)) return;
    try {
      const res = await fetch('/api/sync/pull', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const d = await res.json();
      for (const key of ['subjects', 'tasks', 'notes', 'schedules', 'quizzes', 'studyLogs', 'quizResults', 'studyPlans']) {
        if (Array.isArray(d[key]) && d[key].length) setLocalItem(key, d[key]);
      }
      this.triggerBroadcast();
    } catch {
      /* stay on local cache */
    }
  }

  public async syncWithServer(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.setSyncStatus('offline');
      return false;
    }

    try {
      const token = this.getToken();
      if (!token || OFFLINE_TOKENS.includes(token)) {
        // Offline/demo session: data lives in localStorage only.
        this.setSyncStatus('online-synced');
        return false;
      }
      this.setSyncStatus('syncing');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // 1. Push local changes
      const payload = {
        subjects: this.getSubjects(),
        tasks: this.getTasks(),
        notes: this.getNotes(),
        schedules: this.getSchedules(),
        studyPlans: this.getStudyPlans(),
        quizzes: this.getQuizzes(),
        quizResults: this.getQuizResults(),
        studyLogs: this.getStudyLogs(),
      };

      const pushRes = await fetch('/api/sync/push', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!pushRes.ok) throw new Error('Push sync failed');

      // 2. Pull server changes
      await this.pullFromServer();

      this.setSyncStatus('online-synced');
      this.triggerBroadcast();
      return true;
    } catch (err) {
      console.warn('Sync notice: using local cached persistence:', err);
      this.setSyncStatus(typeof navigator !== 'undefined' && navigator.onLine ? 'online-synced' : 'offline');
      return false;
    }
  }

  public async syncWithBackend(): Promise<boolean> {
    return this.syncWithServer();
  }

  private debounceSync() {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.syncWithServer();
    }, 1200);
  }

  // ==================== SUBJECTS ====================
  public getSubjects(): Subject[] {
    return getLocalItem<Subject[]>('subjects', []);
  }

  public saveSubject(subject: Subject): Subject[] {
    const list = this.getSubjects();
    const idx = list.findIndex((s) => s.id === subject.id);
    let updated: Subject[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = subject;
    } else {
      updated = [subject, ...list];
    }
    setLocalItem('subjects', updated);
    this.debounceSync();
    return updated;
  }

  public deleteSubject(id: string): Subject[] {
    const list = this.getSubjects().filter((s) => s.id !== id);
    setLocalItem('subjects', list);
    this.debounceSync();
    return list;
  }

  // ==================== TASKS ====================
  public getTasks(): Task[] {
    return getLocalItem<Task[]>('tasks', []);
  }

  public saveTask(task: Task): Task[] {
    const list = this.getTasks();
    const idx = list.findIndex((t) => t.id === task.id);
    let updated: Task[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = task;
    } else {
      updated = [task, ...list];
    }
    setLocalItem('tasks', updated);
    this.debounceSync();
    return updated;
  }

  public deleteTask(id: string): Task[] {
    const list = this.getTasks().filter((t) => t.id !== id);
    setLocalItem('tasks', list);
    this.debounceSync();
    return list;
  }

  // ==================== NOTES ====================
  public getNotes(): Note[] {
    return getLocalItem<Note[]>('notes', []);
  }

  public saveNote(note: Note): Note[] {
    const list = this.getNotes();
    const idx = list.findIndex((n) => n.id === note.id);
    let updated: Note[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = { ...note, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...note, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...list];
    }
    setLocalItem('notes', updated);
    this.debounceSync();
    return updated;
  }

  public deleteNote(id: string): Note[] {
    const list = this.getNotes().filter((n) => n.id !== id);
    setLocalItem('notes', list);
    this.debounceSync();
    return list;
  }

  // ==================== SCHEDULES ====================
  public getSchedules(): StudySchedule[] {
    return getLocalItem<StudySchedule[]>('schedules', []);
  }

  public saveSchedule(item: StudySchedule): StudySchedule[] {
    const list = this.getSchedules();
    const idx = list.findIndex((s) => s.id === item.id);
    let updated: StudySchedule[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = item;
    } else {
      updated = [...list, item];
    }
    setLocalItem('schedules', updated);
    this.debounceSync();
    return updated;
  }

  public saveStudySchedule(item: StudySchedule): StudySchedule[] {
    return this.saveSchedule(item);
  }

  public deleteSchedule(id: string): StudySchedule[] {
    const list = this.getSchedules().filter((s) => s.id !== id);
    setLocalItem('schedules', list);
    this.debounceSync();
    return list;
  }

  public deleteStudySchedule(id: string): StudySchedule[] {
    return this.deleteSchedule(id);
  }

  // ==================== STUDY PLANS ====================
  public getStudyPlans(): StudyPlan[] {
    return getLocalItem<StudyPlan[]>('studyPlans', []);
  }

  public saveStudyPlan(plan: StudyPlan): StudyPlan[] {
    const list = this.getStudyPlans();
    const idx = list.findIndex((p) => p.id === plan.id);
    let updated: StudyPlan[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = plan;
    } else {
      updated = [plan, ...list];
    }
    setLocalItem('studyPlans', updated);
    this.debounceSync();
    return updated;
  }

  public deleteStudyPlan(id: string): StudyPlan[] {
    const list = this.getStudyPlans().filter((p) => p.id !== id);
    setLocalItem('studyPlans', list);
    this.debounceSync();
    return list;
  }

  // ==================== QUIZZES & RESULTS ====================
  public getQuizzes(): Quiz[] {
    return getLocalItem<Quiz[]>('quizzes', []);
  }

  public saveQuiz(quiz: Quiz): Quiz[] {
    const list = this.getQuizzes();
    const idx = list.findIndex((q) => q.id === quiz.id);
    let updated: Quiz[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = quiz;
    } else {
      updated = [quiz, ...list];
    }
    setLocalItem('quizzes', updated);
    this.debounceSync();
    return updated;
  }

  public deleteQuiz(id: string): Quiz[] {
    const list = this.getQuizzes().filter((q) => q.id !== id);
    setLocalItem('quizzes', list);
    this.debounceSync();
    return list;
  }

  public getQuizResults(): QuizResult[] {
    return getLocalItem<QuizResult[]>('quizResults', []);
  }

  public saveQuizResult(result: QuizResult): QuizResult[] {
    const list = this.getQuizResults();
    const updated = [result, ...list];
    setLocalItem('quizResults', updated);
    this.debounceSync();
    return updated;
  }

  // ==================== STUDY LOGS / SESSIONS ====================
  public getStudyLogs(): StudyLog[] {
    return getLocalItem<StudyLog[]>('studyLogs', []);
  }

  public addStudyLog(log: StudyLog): StudyLog[] {
    const list = this.getStudyLogs();
    const updated = [log, ...list];
    setLocalItem('studyLogs', updated);
    this.debounceSync();
    return updated;
  }

  public saveStudySession(session: StudySession): StudyLog[] {
    return this.addStudyLog(session);
  }

  // ==================== AI SERVICE CLIENT ====================
  public async generateAIStudyPlan(params: {
    subjects: Array<{ name: string; code: string; topics: string[]; examDate?: string; masteryPercent: number }>;
    examDate: string;
    availableHoursPerDay: number;
    preferredStyle: string;
    focusAreas?: string;
    currentLevel?: string;
  }): Promise<Omit<StudyPlan, 'id' | 'createdAt'>> {
    const res = await fetch('/api/ai/study-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate study plan with AI');
    }
    return await res.json();
  }

  public async summarizeAINote(params: {
    noteContent: string;
    title: string;
    subjectName: string;
    mode?: 'full' | 'bullet_summary' | 'cheat_sheet' | 'key_terms';
  }): Promise<{
    summary: string;
    keyConcepts: Array<{ term: string; definition: string; importance: 'Crucial' | 'High' | 'Medium' }>;
    quickReviewPoints: string[];
    potentialExamQuestions: string[];
    formulaOrCheatSheet?: string;
  }> {
    const res = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to summarize notes with AI');
    }
    return await res.json();
  }

  public async generateAIQuiz(params: {
    subject: string;
    topic: string;
    noteContent?: string;
    questionCount?: number;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
  }): Promise<{
    quizTitle: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
      hint?: string;
    }>;
  }> {
    const res = await fetch('/api/ai/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate AI quiz');
    }
    return await res.json();
  }

  public async askAITutor(params: {
    message: string;
    history: Array<{ role: 'user' | 'model'; content: string }>;
    currentSubject?: string;
    currentTopic?: string;
  }): Promise<string> {
    const res = await fetch('/api/ai/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'AI Tutor failed to respond');
    }
    const data = await res.json();
    return data.reply;
  }
}

export const api = StudyMateAPI.getInstance();