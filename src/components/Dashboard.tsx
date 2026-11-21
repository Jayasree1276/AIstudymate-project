import React from 'react';
import { 
  Subject, 
  Task, 
  Note, 
  StudySchedule, 
  StudyLog, 
  QuizResult, 
  ActiveTab, 
  User 
} from '../types';
import { 
  Sparkles, 
  Flame, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  BookOpen, 
  BrainCircuit, 
  Target, 
  Play, 
  FileText, 
  Award,
  Zap,
  TrendingUp,
  PlusCircle,
  Bot,
  Layers,
  ArrowRight
} from 'lucide-react';
import { formatDaysRemaining, getSubjectColorClasses } from '../utils/theme';

interface DashboardProps {
  user: User | null;
  subjects: Subject[];
  tasks: Task[];
  notes: Note[];
  schedules: StudySchedule[];
  studyLogs: StudyLog[];
  quizResults: QuizResult[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenTimerForSubject: (subjectId: string, topic?: string) => void;
  onOpenTutorForSubject: (subjectId?: string) => void;
  onStartQuiz: (quizId?: string) => void;
  onQuickToggleTask: (taskId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  subjects,
  tasks,
  notes,
  schedules,
  studyLogs,
  quizResults,
  setActiveTab,
  onOpenTimerForSubject,
  onOpenTutorForSubject,
  onStartQuiz,
  onQuickToggleTask,
}) => {
  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate metrics
  const todayLogs = studyLogs.filter((l) => l.date === todayStr);
  const totalMinutesToday = todayLogs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
  const hoursToday = (totalMinutesToday / 60).toFixed(1);

  // Total study time overall
  const totalStudyMinutes = studyLogs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  // Pending and high priority tasks
  const pendingTasks = tasks.filter((t) => t.status !== 'done');
  const highPriorityTasks = pendingTasks
    .filter((t) => t.priority === 'High')
    .slice(0, 4);
  const completedTasksCount = tasks.filter((t) => t.status === 'done').length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  // Today's schedule
  const todaySchedules = schedules.filter((s) => s.date === todayStr);

  // Upcoming Exams sorted by closest date
  const upcomingExams = subjects
    .filter((s) => s.examDate)
    .map((s) => ({
      subject: s,
      countdown: formatDaysRemaining(s.examDate),
    }))
    .sort((a, b) => a.countdown.days - b.countdown.days);

  // Average Quiz Score
  const avgQuizScore = quizResults.length > 0
    ? Math.round(quizResults.reduce((acc, q) => acc + q.percentage, 0) / quizResults.length)
    : null; // no quizzes taken yet: show a dash instead of a made-up number

  // Compute 7-day activity for Learning Progress
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date();
  const mondayOffset = (now.getUTCDay() + 6) % 7; // 0 = Monday (UTC, matching how logs are dated)
  const weekMinutes = weekdays.map((_, i) => {
    const d = new Date(now);
    d.setUTCDate(now.getUTCDate() - mondayOffset + i);
    const key = d.toISOString().split('T')[0];
    return studyLogs.filter((l) => l.date === key).reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
  });
  const maxWeekMinutes = Math.max(...weekMinutes, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* 12-Column Main Dashboard Grid matching Professional Polish Design */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 8 Columns */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Top 3 KPI Metric Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Metric 1: Courses */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                Courses
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {subjects.length < 10 ? `0${subjects.length}` : subjects.length}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Active Enrolled Curriculums
              </p>
            </div>

            {/* Metric 2: Study Time */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                Study Time
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {Number(totalStudyHours) > 0 ? `${totalStudyHours}h` : `${hoursToday}h`}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {hoursToday}h recorded today
              </p>
            </div>

            {/* Metric 3: Success Rate */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 text-indigo-600">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                Success Rate
              </p>
              <p className="text-3xl font-bold text-indigo-600">
                {avgQuizScore === null ? '--' : `${avgQuizScore}%`}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Active Recall Accuracy
              </p>
            </div>

          </section>

          {/* Upcoming Study Tasks Table Container matching Professional Polish */}
          <section className="bg-white rounded-2xl shadow-xs border border-slate-100 flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Upcoming Study Tasks</h3>
                <p className="text-xs text-slate-500 mt-0.5">High priority assignments & problem sets</p>
              </div>
              <button 
                onClick={() => setActiveTab('tasks')}
                className="text-indigo-600 text-xs sm:text-sm font-semibold hover:underline flex items-center gap-1"
              >
                View Full List <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-left">
                  <tr>
                    <th className="px-6 py-3 font-semibold uppercase text-[10px] tracking-wider">Task Name</th>
                    <th className="px-6 py-3 font-semibold uppercase text-[10px] tracking-wider">Subject</th>
                    <th className="px-6 py-3 font-semibold uppercase text-[10px] tracking-wider">Deadline</th>
                    <th className="px-6 py-3 font-semibold uppercase text-[10px] tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.slice(0, 5).map((task) => {
                    const subject = subjects.find((s) => s.id === task.subjectId);
                    const isDone = task.status === 'done';
                    const isInProgress = task.status === 'in-progress';

                    return (
                      <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => onQuickToggleTask(task.id)}
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                isDone 
                                  ? 'bg-emerald-600 border-emerald-600 text-white' 
                                  : 'border-slate-300 hover:border-indigo-500'
                              }`}
                            >
                              {isDone && <CheckCircle2 className="w-3 h-3" />}
                            </button>
                            <span className={`font-medium text-xs sm:text-sm ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {task.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 italic">
                          {subject ? `${subject.code} • ${subject.name}` : 'General'}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                          {task.dueDate}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isDone ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] rounded-md uppercase font-bold">
                              Done
                            </span>
                          ) : isInProgress ? (
                            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-[10px] rounded-md uppercase font-bold">
                              AI Ready
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] rounded-md uppercase font-bold">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-xs text-slate-400">
                        No tasks created yet. Click Add Task to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Today's Timetable & Schedule */}
          <section className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-base">Today's Study Schedule</h3>
              </div>
              <button 
                onClick={() => setActiveTab('scheduler')}
                className="text-indigo-600 text-xs font-semibold hover:underline flex items-center"
              >
                Schedule Planner <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            {todaySchedules.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No sessions scheduled for today yet.</p>
                <button
                  onClick={() => setActiveTab('planner')}
                  className="mt-3 px-3.5 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  Generate AI Daily Timetable
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaySchedules.map((sch) => {
                  const subject = subjects.find((s) => s.id === sch.subjectId);
                  const colors = getSubjectColorClasses(subject?.color || 'indigo');
                  return (
                    <div
                      key={sch.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-mono font-bold text-xs">
                          {sch.startTime}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{sch.title}</h4>
                            {subject && (
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${colors.badge}`}>
                                {subject.code}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {sch.durationMinutes} mins • <span className="font-medium text-slate-700">{sch.sessionType}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenTimerForSubject(sch.subjectId, sch.title)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Start</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Upcoming Exam Countdown Timelines */}
          <section className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-800 text-base">Upcoming Exam Timelines</h3>
              </div>
              <button 
                onClick={() => setActiveTab('subjects')} 
                className="text-xs text-indigo-600 font-semibold hover:underline flex items-center"
              >
                Manage Subjects <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            {upcomingExams.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No exam dates configured yet. Add exam dates in Subjects to track countdowns!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {upcomingExams.slice(0, 4).map(({ subject, countdown }) => {
                  const colors = getSubjectColorClasses(subject.color);
                  return (
                    <div
                      key={subject.id}
                      className={`p-4 rounded-xl border transition-all ${
                        countdown.urgent 
                          ? 'border-rose-200 bg-rose-50/40' 
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${colors.badge}`}>
                            {subject.code}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1 truncate max-w-[180px]">
                            {subject.name}
                          </h4>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          countdown.urgent ? 'bg-rose-100 text-rose-700 font-extrabold' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {countdown.text}
                        </span>
                      </div>

                      {/* Mastery Progress */}
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Syllabus Mastery</span>
                          <span className="font-bold text-slate-700">{subject.masteryPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${colors.bg}`}
                            style={{ width: `${subject.masteryPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Action */}
                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">Target: <strong className="text-slate-800">{subject.targetGrade || 'A'}</strong></span>
                        <button
                          onClick={() => onOpenTimerForSubject(subject.id, `Revision: ${subject.name}`)}
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          <Play className="w-3 h-3 fill-indigo-600" />
                          <span>Start Study</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>

        {/* Right 4 Columns */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* AI Study Assistant Card matching Professional Polish Theme */}
          <section className="bg-indigo-600 rounded-2xl p-6 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-400/40 p-1.5 rounded-lg flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">AI Study Assistant</h3>
            </div>
            
            <p className="text-sm text-indigo-100 mb-6 leading-relaxed">
              Need a personalized study plan? Select your subjects and I'll generate a timeline and practice questions for you.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => setActiveTab('notes')}
                className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-3 px-4 rounded-xl text-left flex justify-between items-center transition-colors cursor-pointer"
              >
                <span>Summarize Last Note</span>
                <span>→</span>
              </button>

              <button 
                onClick={() => onStartQuiz()}
                className="w-full bg-white text-indigo-600 text-xs font-bold py-3 px-4 rounded-xl text-left flex justify-between items-center shadow-lg hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <span>Generate Practice Quiz</span>
                <span>→</span>
              </button>

              <button 
                onClick={() => setActiveTab('planner')}
                className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-3 px-4 rounded-xl text-left flex justify-between items-center transition-colors cursor-pointer"
              >
                <span>Create Exam Prep Plan</span>
                <span>→</span>
              </button>

              <button 
                onClick={() => onOpenTutorForSubject()}
                className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-3 px-4 rounded-xl text-left flex justify-between items-center transition-colors cursor-pointer"
              >
                <span>Ask Socratic AI Tutor</span>
                <span>→</span>
              </button>
            </div>
          </section>

          {/* Learning Progress Weekly Chart Card matching Professional Polish Theme */}
          <section className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-4 text-sm">Learning Progress</h3>
            
            <div className="flex items-end justify-between h-24 mb-4 gap-2">
              {weekMinutes.map((mins, i) => {
                const isToday = i === mondayOffset;
                const pct = maxWeekMinutes > 0 ? Math.max((mins / maxWeekMinutes) * 100, mins > 0 ? 8 : 0) : 0;
                return (
                  <div key={weekdays[i]} className="w-full h-full flex items-end" title={`${weekdays[i]}: ${mins} min`}>
                    <div
                      className={`w-full rounded-t-lg transition-all ${isToday ? 'bg-indigo-500' : 'bg-slate-200'}`}
                      style={{ height: `${pct}%`, minHeight: mins > 0 ? undefined : '2px' }}
                    ></div>
                  </div>
                );
              })}
            </div>
            {maxWeekMinutes === 0 && (
              <p className="text-[11px] text-slate-400 text-center -mt-1 mb-3">No study sessions logged this week. Start the Focus Timer to see your activity.</p>
            )}

            <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </section>

          {/* Subject Mastery Progress Card */}
          <section className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">Subject Progress</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">{subjects.length} Courses</span>
            </div>

            <div className="space-y-4">
              {subjects.map((sub) => {
                const colors = getSubjectColorClasses(sub.color);
                return (
                  <div key={sub.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors.bg}`} />
                        <span className="font-bold text-slate-800">{sub.code}</span>
                        <span className="text-slate-500 text-[11px] truncate">{sub.name}</span>
                      </div>
                      <span className="font-bold text-slate-700">{sub.masteryPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colors.bg}`}
                        style={{ width: `${sub.masteryPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setActiveTab('subjects')}
              className="mt-5 w-full py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add or Edit Subject Details
            </button>
          </section>

        </div>

      </div>

    </div>
  );
};