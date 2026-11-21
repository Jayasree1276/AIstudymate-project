export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  academicGoal?: string;
  token?: string;
}

export type UserProfile = User;

export type SubjectColor = 
  | 'emerald' 
  | 'indigo' 
  | 'amber' 
  | 'rose' 
  | 'violet' 
  | 'cyan' 
  | 'blue' 
  | 'fuchsia'
  | 'slate';

export interface Subject {
  id: string;
  userId?: string;
  code: string; // e.g. "CS201", "MATH101"
  name: string; // e.g. "Data Structures & Algorithms"
  instructor?: string;
  color: SubjectColor;
  targetGrade?: string; // e.g. "A+", "95%"
  creditHours?: number;
  examDate?: string; // YYYY-MM-DD
  topics: string[];
  masteryPercent: number; // 0 - 100
  createdAt: string;
}

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  userId?: string;
  subjectId: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  estimatedMinutes: number;
  actualMinutesSpent?: number;
  tags?: string[];
  createdAt: string;
}

export interface KeyConcept {
  term: string;
  definition: string;
  importance: 'Crucial' | 'High' | 'Medium';
}

export interface Note {
  id: string;
  userId?: string;
  subjectId: string;
  title: string;
  content: string; // Markdown supported
  tags: string[];
  isFavorite?: boolean;
  aiSummary?: string;
  keyConcepts?: KeyConcept[];
  quickReviewPoints?: string[];
  cheatSheetMarkdown?: string;
  updatedAt: string;
  createdAt: string;
}

export interface StudySchedule {
  id: string;
  userId?: string;
  subjectId: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  sessionType: 'Theory / Reading' | 'Practice Problems' | 'Revision & Flashcards' | 'Mock Test';
  isCompleted: boolean;
  actionItems?: string[];
  notes?: string;
}

export interface WeeklyMilestone {
  weekNumber: number;
  theme: string;
  goals: string[];
}

export interface StudyPlanItem {
  day: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  sessionType: 'Theory / Reading' | 'Practice Problems' | 'Revision & Flashcards' | 'Mock Test';
  actionItems: string[];
}

export interface StudyPlan {
  id: string;
  userId?: string;
  title: string;
  overview: string;
  strategyTips: string[];
  dailyTargetHours: number;
  weeklyMilestones: WeeklyMilestone[];
  schedule: StudyPlanItem[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export interface Quiz {
  id: string;
  userId?: string;
  subjectId?: string;
  topic: string;
  quizTitle: string;
  description?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizResult {
  id: string;
  userId?: string;
  quizId: string;
  quizTitle: string;
  subjectName?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: Array<{
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
  }>;
  completedAt: string;
}

export interface StudyLog {
  id: string;
  userId?: string;
  subjectId: string;
  subjectName?: string;
  taskOrTopicTitle?: string;
  topic?: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  type?: 'Pomodoro' | 'Deep Focus' | 'Quick Revision' | 'Quiz Practice';
  createdAt?: string;
}

export type StudySession = StudyLog;

export type ActiveTab = 
  | 'dashboard' 
  | 'subjects' 
  | 'tasks' 
  | 'notes' 
  | 'planner' 
  | 'study-plans'
  | 'quizzes' 
  | 'scheduler'
  | 'analytics';

export type AppNavigationTab = ActiveTab;

export type SyncStatus = 'online-synced' | 'syncing' | 'offline' | 'error';
