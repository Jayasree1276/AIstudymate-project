import React, { useState } from 'react';
import { Subject, StudySchedule } from '../types';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Play, 
  BookOpen, 
  Layers, 
  Check, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getSubjectColorClasses } from '../utils/theme';

interface SchedulerManagerProps {
  schedules: StudySchedule[];
  subjects: Subject[];
  onSaveSchedule: (item: StudySchedule) => void;
  onDeleteSchedule: (id: string) => void;
  onOpenTimerForSchedule: (subjectId: string, title: string) => void;
}

export const SchedulerManager: React.FC<SchedulerManagerProps> = ({
  schedules,
  subjects,
  onSaveSchedule,
  onDeleteSchedule,
  onOpenTimerForSchedule,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<StudySchedule | null>(null);

  // Group schedules by date or filter for selected date
  const filteredSchedules = schedules
    .filter((s) => s.date === selectedDate)
    .sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

  const handleOpenAdd = () => {
    setEditingSchedule({
      id: `sch-${Date.now()}`,
      subjectId: subjects[0]?.id || '',
      title: '',
      date: selectedDate,
      startTime: '10:00',
      durationMinutes: 45,
      sessionType: 'Theory / Reading',
      isCompleted: false,
      actionItems: [],
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule || !editingSchedule.title || !editingSchedule.subjectId) return;
    onSaveSchedule(editingSchedule);
    setIsModalOpen(false);
    setEditingSchedule(null);
  };

  const handleToggleComplete = (sch: StudySchedule) => {
    onSaveSchedule({ ...sch, isCompleted: !sch.isCompleted });
  };

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
            Study Timetable & Session Scheduler
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Plan daily focus blocks, link to coursework, and launch synchronized Pomodoro sessions.
          </p>
        </div>

        <button
          id="btn-add-schedule-session"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Session</span>
        </button>
      </div>

      {/* Date Navigation & Filter Ribbon */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        
        {/* Date Stepper */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftDate(-1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <button
            onClick={() => shiftDate(1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-2.5 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100"
          >
            Today
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {filteredSchedules.length} Sessions Planned for {new Date(selectedDate).toDateString()}
        </div>

      </div>

      {/* Sessions Timeline List */}
      <div className="space-y-3">
        {filteredSchedules.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No study sessions scheduled for this date</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add a study block manually or generate an AI Study Plan to populate your calendar automatically.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-xs"
            >
              Schedule Study Session
            </button>
          </div>
        ) : (
          filteredSchedules.map((sch) => {
            const subject = subjects.find((s) => s.id === sch.subjectId);
            const colors = getSubjectColorClasses(subject?.color || 'indigo');

            return (
              <div
                key={sch.id}
                className={`bg-white rounded-xl border p-4 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  sch.isCompleted ? 'border-slate-200 bg-slate-50/40 opacity-80' : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => handleToggleComplete(sch)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                      sch.isCompleted ? 'bg-emerald-600 text-white' : 'border border-slate-300 hover:border-indigo-500'
                    }`}
                  >
                    {sch.isCompleted ? <Check className="w-3.5 h-3.5" /> : null}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                        {sch.startTime} ({sch.durationMinutes}m)
                      </span>
                      {subject && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors.badge}`}>
                          {subject.code}
                        </span>
                      )}
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {sch.sessionType}
                      </span>
                    </div>

                    <h4 className={`text-sm sm:text-base font-bold mt-1 ${sch.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {sch.title}
                    </h4>

                    {sch.actionItems && sch.actionItems.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {sch.actionItems.map((item, idx) => (
                          <span key={idx} className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            • {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {!sch.isCompleted && (
                    <button
                      onClick={() => onOpenTimerForSchedule(sch.subjectId, sch.title)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Start Focus</span>
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteSchedule(sch.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Schedule Modal */}
      {isModalOpen && editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Schedule Study Session</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5 text-xs">
              
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Course / Subject *</label>
                <select
                  required
                  value={editingSchedule.subjectId}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Topic or Session Focus *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graph BFS/DFS Problem Solving or Organic Reactions Drill"
                  value={editingSchedule.title}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Date *</label>
                  <input
                    type="date"
                    required
                    value={editingSchedule.date}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Start Time</label>
                  <input
                    type="time"
                    value={editingSchedule.startTime}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={editingSchedule.durationMinutes}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Session Format</label>
                  <select
                    value={editingSchedule.sessionType}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, sessionType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Theory / Reading">Theory / Reading</option>
                    <option value="Practice Problems">Practice Problems</option>
                    <option value="Revision & Flashcards">Revision & Flashcards</option>
                    <option value="Mock Test">Mock Test</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Target Action Items (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Solve 3 problems, Memorize 5 formulas"
                  value={(editingSchedule.actionItems || []).join(', ')}
                  onChange={(e) =>
                    setEditingSchedule({
                      ...editingSchedule,
                      actionItems: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Save to Timetable
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
