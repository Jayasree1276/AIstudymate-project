import React, { useState, useEffect } from 'react';
import { 
  Subject, 
  Task, 
  Note, 
  StudyPlan, 
  Quiz, 
  QuizResult, 
  StudySchedule, 
  StudyLog, 
  User, 
  ActiveTab,
  SyncStatus
} from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SubjectsManager } from './components/SubjectsManager';
import { TasksManager } from './components/TasksManager';
import { NotesManager } from './components/NotesManager';
import { StudyPlanGenerator } from './components/StudyPlanGenerator';
import { QuizGenerator } from './components/QuizGenerator';
import { SchedulerManager } from './components/SchedulerManager';
import { AnalyticsView } from './components/AnalyticsView';
import { FocusTimerModal } from './components/FocusTimerModal';
import { AITutorModal } from './components/AITutorModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // App Data State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [studySchedules, setStudySchedules] = useState<StudySchedule[]>([]);
  const [studySessions, setStudySessions] = useState<StudyLog[]>([]);

  // User & Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('online-synced');

  // Modals
  const [isTimerOpen, setIsTimerOpen] = useState<boolean>(false);
  const [timerSubjectId, setTimerSubjectId] = useState<string | undefined>(undefined);
  const [timerTopic, setTimerTopic] = useState<string | undefined>(undefined);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState<number>(25 * 60);

  const [isAITutorOpen, setIsAITutorOpen] = useState<boolean>(false);
  const [tutorSubjectId, setTutorSubjectId] = useState<string | undefined>(undefined);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Targeted Context Navigation (e.g. create quiz from note)
  const [quizTargetSubject, setQuizTargetSubject] = useState<Subject | null>(null);
  const [quizTargetTopic, setQuizTargetTopic] = useState<string>('');
  const [quizTargetNoteContent, setQuizTargetNoteContent] = useState<string>('');

  const [planTargetSubject, setPlanTargetSubject] = useState<Subject | null>(null);

  // Refresh all state from local cache
  const refreshStateFromLocal = () => {
    const data = api.getData();
    setSubjects(data.subjects);
    setTasks(data.tasks);
    setNotes(data.notes);
    setStudyPlans(data.studyPlans);
    setQuizzes(data.quizzes);
    setQuizResults(data.quizResults);
    setStudySchedules(data.studySchedules);
    setStudySessions(data.studySessions);
  };

  // Initialize data on load
  useEffect(() => {
    refreshStateFromLocal();
    const user = api.getUser();
    setCurrentUser(user);

    // Sync listener
    const unsubscribeSync = api.onSyncStatusChange((status) => {
      setSyncStatus(status);
      refreshStateFromLocal();
    });

    return () => {
      unsubscribeSync();
    };
  }, []);

  const handleManualSync = async () => {
    await api.syncWithServer();
    refreshStateFromLocal();
  };

  // --- Subject Handlers ---
  const handleSaveSubject = (sub: Subject) => {
    api.saveSubject(sub);
    refreshStateFromLocal();
  };

  const handleDeleteSubject = (id: string) => {
    api.deleteSubject(id);
    refreshStateFromLocal();
  };

  // --- Task Handlers ---
  const handleSaveTask = (task: Task) => {
    api.saveTask(task);
    refreshStateFromLocal();
  };

  const handleDeleteTask = (id: string) => {
    api.deleteTask(id);
    refreshStateFromLocal();
  };

  const handleQuickToggleTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      handleSaveTask({
        ...task,
        status: task.status === 'done' ? 'todo' : 'done',
      });
    }
  };

  // --- Note Handlers ---
  const handleSaveNote = (note: Note) => {
    api.saveNote(note);
    refreshStateFromLocal();
  };

  const handleDeleteNote = (id: string) => {
    api.deleteNote(id);
    refreshStateFromLocal();
  };

  // --- Study Plan Handlers ---
  const handleSaveStudyPlan = (plan: StudyPlan) => {
    api.saveStudyPlan(plan);
    refreshStateFromLocal();
  };

  const handleDeleteStudyPlan = (id: string) => {
    api.deleteStudyPlan(id);
    refreshStateFromLocal();
  };

  const handleApplyPlanToSchedules = (schedules: StudySchedule[]) => {
    schedules.forEach((sch) => api.saveSchedule(sch));
    refreshStateFromLocal();
  };

  // --- Quiz Handlers ---
  const handleSaveQuiz = (quiz: Quiz) => {
    api.saveQuiz(quiz);
    refreshStateFromLocal();
  };

  const handleDeleteQuiz = (id: string) => {
    api.deleteQuiz(id);
    refreshStateFromLocal();
  };

  const handleSaveQuizResult = (result: QuizResult) => {
    api.saveQuizResult(result);
    refreshStateFromLocal();
  };

  // --- Schedule Handlers ---
  const handleSaveSchedule = (sch: StudySchedule) => {
    api.saveSchedule(sch);
    refreshStateFromLocal();
  };

  const handleDeleteSchedule = (id: string) => {
    api.deleteSchedule(id);
    refreshStateFromLocal();
  };

  // --- Timer Session Completed ---
  const handleSessionComplete = (session: StudyLog) => {
    api.addStudyLog(session);
    refreshStateFromLocal();
    setIsTimerOpen(false);
  };

  // --- Context Shortcut Actions ---
  const openTimerFor = (subId?: string, topic?: string) => {
    setTimerSubjectId(subId);
    setTimerTopic(topic);
    setIsTimerOpen(true);
  };

  const openAITutorFor = (subId?: string) => {
    setTutorSubjectId(subId);
    setIsAITutorOpen(true);
  };

  const handleGenerateQuizForSubject = (subject: Subject) => {
    setQuizTargetSubject(subject);
    setQuizTargetTopic(subject.topics[0] || '');
    setQuizTargetNoteContent('');
    setActiveTab('quizzes');
  };

  const handleGenerateQuizFromNote = (note: Note) => {
    const subject = subjects.find((s) => s.id === note.subjectId) || null;
    setQuizTargetSubject(subject);
    setQuizTargetTopic(note.title);
    setQuizTargetNoteContent(note.content);
    setActiveTab('quizzes');
  };

  const handleGeneratePlanForSubject = (subject: Subject) => {
    setPlanTargetSubject(subject);
    setActiveTab('planner');
  };

  // Login gate: nothing from the app is shown until the user signs in, registers, or opts into the demo.
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-100 to-white flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md mb-2">
          <h1 className="text-3xl font-bold text-slate-900">AI StudyMate</h1>
          <p className="text-sm text-slate-500 mt-1">Your AI-powered study planner. Sign in or create an account to begin.</p>
        </div>
        <AuthModal
          isOpen={true}
          onClose={() => {}}
          currentUser={null}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            handleManualSync();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Top Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        syncStatus={syncStatus}
        onManualSync={handleManualSync}
        onOpenTimer={() => openTimerFor()}
        onOpenTutor={() => openAITutorFor()}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        user={currentUser}
        onLogout={() => {
          api.logout();
          setCurrentUser(null);
        }}
        isTimerRunning={isTimerRunning}
        timerSecondsRemaining={timerSecondsRemaining}
      />

      {/* Main Screen Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {activeTab === 'dashboard' && (
          <Dashboard
            user={currentUser}
            subjects={subjects}
            tasks={tasks}
            notes={notes}
            schedules={studySchedules}
            studyLogs={studySessions}
            quizResults={quizResults}
            setActiveTab={setActiveTab}
            onOpenTimerForSubject={openTimerFor}
            onOpenTutorForSubject={openAITutorFor}
            onStartQuiz={() => setActiveTab('quizzes')}
            onQuickToggleTask={handleQuickToggleTask}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectsManager
            subjects={subjects}
            onSaveSubject={handleSaveSubject}
            onDeleteSubject={handleDeleteSubject}
            onOpenTimerForSubject={openTimerFor}
            onGenerateQuizForSubject={handleGenerateQuizForSubject}
            onGeneratePlanForSubject={handleGeneratePlanForSubject}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksManager
            tasks={tasks}
            subjects={subjects}
            onSaveTask={handleSaveTask}
            onDeleteTask={handleDeleteTask}
            onOpenTimerForTask={(subId, title) => openTimerFor(subId, `Task: ${title}`)}
          />
        )}

        {activeTab === 'notes' && (
          <NotesManager
            notes={notes}
            subjects={subjects}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            onGenerateQuizFromNote={handleGenerateQuizFromNote}
          />
        )}

        {(activeTab === 'planner' || activeTab === 'study-plans') && (
          <StudyPlanGenerator
            subjects={subjects}
            studyPlans={studyPlans}
            onSaveStudyPlan={handleSaveStudyPlan}
            onDeleteStudyPlan={handleDeleteStudyPlan}
            onApplyPlanToSchedules={handleApplyPlanToSchedules}
            initialSubject={planTargetSubject}
          />
        )}

        {activeTab === 'quizzes' && (
          <QuizGenerator
            subjects={subjects}
            quizzes={quizzes}
            quizResults={quizResults}
            onSaveQuiz={handleSaveQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onSaveQuizResult={handleSaveQuizResult}
            initialSubject={quizTargetSubject}
            initialTopic={quizTargetTopic}
            initialNoteContent={quizTargetNoteContent}
          />
        )}

        {activeTab === 'scheduler' && (
          <SchedulerManager
            schedules={studySchedules}
            subjects={subjects}
            onSaveSchedule={handleSaveSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onOpenTimerForSchedule={(subId, title) => openTimerFor(subId, `Session: ${title}`)}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            subjects={subjects}
            tasks={tasks}
            notes={notes}
            quizResults={quizResults}
            studySessions={studySessions}
          />
        )}

      </main>

      {/* Focus Timer Modal */}
      <FocusTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        subjects={subjects}
        initialSubjectId={timerSubjectId}
        initialTopic={timerTopic}
        onSessionComplete={handleSessionComplete}
      />

      {/* Socratic AI Tutor Modal */}
      <AITutorModal
        isOpen={isAITutorOpen}
        onClose={() => setIsAITutorOpen(false)}
        subjects={subjects}
        initialSubjectId={tutorSubjectId}
      />

      {/* Auth / Account Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          handleManualSync();
        }}
      />

    </div>
  );
}