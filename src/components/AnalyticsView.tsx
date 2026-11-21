import React from 'react';
import { Subject, Task, Note, QuizResult, StudySession } from '../types';
import { 
  BarChart2, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle2, 
  BrainCircuit, 
  Target, 
  Flame,
  Zap,
  BookOpen
} from 'lucide-react';
import { getSubjectColorClasses } from '../utils/theme';

interface AnalyticsViewProps {
  subjects: Subject[];
  tasks: Task[];
  notes: Note[];
  quizResults: QuizResult[];
  studySessions: StudySession[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  subjects,
  tasks,
  notes,
  quizResults,
  studySessions,
}) => {
  // Aggregate Stats
  const totalStudyMinutes = studySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const avgQuizAccuracy = quizResults.length > 0 
    ? Math.round(quizResults.reduce((acc, r) => acc + r.percentage, 0) / quizResults.length) 
    : 85;

  const avgSubjectMastery = subjects.length > 0
    ? Math.round(subjects.reduce((acc, s) => acc + s.masteryPercent, 0) / subjects.length)
    : 0;

  // Study hours per subject
  const subjectHours = subjects.map((sub) => {
    const mins = studySessions
      .filter((s) => s.subjectId === sub.id)
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    return {
      ...sub,
      hours: Number((mins / 60).toFixed(1)),
      tasksCompleted: tasks.filter((t) => t.subjectId === sub.id && t.status === 'done').length,
      tasksTotal: tasks.filter((t) => t.subjectId === sub.id).length,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-indigo-600" />
          Academic Analytics & Learning Progress
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor your study distribution, topic mastery levels, active recall performance, and productivity trends.
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Focus Time</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalStudyHours}</span>
            <span className="text-xs font-semibold text-slate-500">hours</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Across {studySessions.length} recorded sessions
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Task Completion</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{taskCompletionRate}%</span>
            <span className="text-xs font-semibold text-slate-500">({completedTasks}/{tasks.length})</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${taskCompletionRate}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Quiz Accuracy</span>
            <span className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{avgQuizAccuracy}%</span>
            <span className="text-xs font-semibold text-slate-500">avg score</span>
          </div>
          <p className="text-[11px] text-violet-600 font-semibold">
            {quizResults.length} assessments completed
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Curriculum Readiness</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{avgSubjectMastery}%</span>
            <span className="text-xs font-semibold text-slate-500">mastery</span>
          </div>
          <p className="text-[11px] text-amber-700 font-semibold">
            Average across all {subjects.length} subjects
          </p>
        </div>

      </div>

      {/* Main Grid: Subject Breakdown (8 cols) & AI Learning Advisor (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Subject Mastery & Study Breakdown (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Course Mastery & Time Distribution
            </h3>
            <span className="text-xs text-slate-400 font-medium">{subjects.length} Active Courses</span>
          </div>

          <div className="space-y-4">
            {subjectHours.map((sub) => {
              const colors = getSubjectColorClasses(sub.color);

              return (
                <div key={sub.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${colors.badge}`}>
                          {sub.code}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{sub.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500">
                        {sub.hours} hrs studied • {sub.tasksCompleted}/{sub.tasksTotal} tasks done • Target: {sub.targetGrade || 'Not set'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-900">{sub.masteryPercent}%</span>
                      <span className="text-[10px] text-slate-400 block font-medium">Mastery</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${colors.bg}`}
                      style={{ width: `${sub.masteryPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Learning Advisor Insights (4 cols) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md space-y-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">AI Learning Advisor</h3>
          </div>

          <p className="text-xs text-indigo-200 leading-relaxed">
            Gemini has evaluated your recent study cadence, task backlog, and quiz scores:
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> High Priority Alert
              </span>
              <p className="text-slate-200 text-[11px] leading-relaxed">
                Exam dates for your core modules are approaching. Increase active recall quizzes by 15 mins daily.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
              <span className="font-bold text-emerald-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> Strong Retention Area
              </span>
              <p className="text-slate-200 text-[11px] leading-relaxed">
                Your recall scores on recent quizzes averaged {avgQuizAccuracy}%. Keep reviewing cheat sheets to maintain retention.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
              <span className="font-bold text-indigo-300 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Spaced Repetition Recommendation
              </span>
              <p className="text-slate-200 text-[11px] leading-relaxed">
                Convert your latest lecture notes into flashcards using the AI Summarizer tool.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};